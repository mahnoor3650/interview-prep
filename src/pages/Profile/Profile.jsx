// src/pages/Profile/Profile.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '../../hooks/redux';
import { useDispatch } from 'react-redux';
import { updateUserProfile, updatePassword } from '../../store/slices/authSlice';
import { databaseService } from '../../services/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const user = useUser();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      fullName: '',
      bio: '',
      experience: '',
      skills: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watchPassword('newPassword');

  // Load user profile data from Supabase
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const { data, error } = await databaseService.getUserProfile(user.id);
        
        if (error) {
          console.error('Error loading profile:', error);
          // If no profile exists, use basic user data
          setProfileData({
            full_name: user.full_name || '',
            bio: '',
            experience_level: '',
            skills: [],
          });
        } else {
          setProfileData(data || {
            full_name: user.full_name || '',
            bio: '',
            experience_level: '',
            skills: [],
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfileData({
          full_name: user.full_name || '',
          bio: '',
          experience_level: '',
          skills: [],
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [user?.id]);

  // Update form when profile data is loaded
  useEffect(() => {
    if (profileData) {
      reset({
        fullName: profileData.full_name || '',
        bio: profileData.bio || '',
        experience: profileData.experience_level || '',
        skills: profileData.skills ? (Array.isArray(profileData.skills) ? profileData.skills.join(', ') : profileData.skills) : '',
      });
    }
  }, [profileData, reset]);

  const onSubmit = async (data) => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'User not authenticated' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare profile data for Supabase
      const profileData = {
        full_name: data.fullName,
        bio: data.bio || null,
        experience_level: data.experience || null,
        skills: data.skills ? data.skills.split(',').map(skill => skill.trim()) : null,
      };

      // Update profile in Supabase
      const { data: updatedProfile, error } = await databaseService.updateUserProfile(
        user.id,
        profileData
      );

      if (error) {
        throw error;
      }

      // Update Redux store with new profile data
      dispatch(updateUserProfile({
        full_name: data.fullName,
        bio: data.bio,
        experience_level: data.experience,
        skills: data.skills,
      }));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await dispatch(updatePassword(data.newPassword));
      toast.success('Password updated successfully!');
      setShowChangePassword(false);
      resetPassword();
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  // Show loading state while fetching profile data
  if (isLoadingProfile) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData?.full_name || user?.full_name || 'User Profile'}
              </h1>
              <p className="text-gray-600">{profileData?.email || user?.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                type="text"
                disabled={!isEditing}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed. Contact support if you need to update your email.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                disabled={!isEditing}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                {...register('experience')}
                disabled={!isEditing}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select experience level</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6-10 years)</option>
                <option value="lead">Lead/Principal (10+ years)</option>
              </select>
            </div>

            {/* Skills */}
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Skills
              </label>
              <input
                {...register('skills')}
                type="text"
                disabled={!isEditing}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="JavaScript, React, Node.js, Python..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate skills with commas
              </p>
            </div>

            {/* Form Actions */}
            {isEditing && (
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
              <button 
                onClick={() => setShowChangePassword(true)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Change
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">Permanently delete your account</p>
              </div>
              <button 
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                style={{ backgroundColor: '#dc2626' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    resetPassword();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                      },
                    })}
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === newPassword || 'Passwords do not match',
                    })}
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      resetPassword();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isChangingPassword ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
