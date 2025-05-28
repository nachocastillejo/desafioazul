import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, ArrowRight, Loader2 } from 'lucide-react'; // Using Camera for profile image placeholder, added Loader2
import { supabase } from '../lib/supabase'; // Import supabase client for storage operations

function SettingsPage() {
  const { profile, updateProfile, loading: authLoading, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  // State for form fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [academy, setAcademy] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(''); // For displaying current image
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the selected file object
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // State for the new image preview URL
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setAcademy(profile.academy || '');
      setBio(profile.bio || '');
      setProfileImageUrl(profile.profile_image_url || '');
      setImagePreviewUrl(null); // Clear preview when profile data changes
      setSelectedFile(null); // Clear selected file
    }
  }, [profile]);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true); // Start submission loading

    let newProfileImageUrl = profileImageUrl;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `images/${fileName}`; // Corrected path to use 'images' folder

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('my-bucket') // Corrected bucket name
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true, 
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Consider showing a toast to the user
          throw uploadError; // Throw error to be caught by outer try-catch
        }

        if (uploadData) {
          const { data: urlData } = supabase.storage.from('my-bucket').getPublicUrl(filePath); // Corrected bucket name
          newProfileImageUrl = urlData.publicUrl;
        }
      }

      const updatedData: any = {
        username,
        full_name: fullName,
        academy,
        bio,
        profile_image_url: newProfileImageUrl, // Use the new or existing image URL
      };

      const { data, error: updateError } = await updateProfile(updatedData);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        // Consider showing a toast to the user
        throw updateError; // Throw error to be caught by outer try-catch
      } else {
        console.log("Profile updated successfully:", data);
        setSelectedFile(null); // Clear selected file after successful update
        setImagePreviewUrl(null); // Clear preview
        // Optionally, display a success toast
      }
    } catch (error) {
      // Error already logged by specific catch blocks or will be generic here
      console.error("An error occurred during profile update:", error);
      // Display a generic error toast to the user if not already handled
    } finally {
      setIsSubmitting(false); // End submission loading regardless of outcome
    }
  };

  if (authLoading && !profile) { 
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Ajustes de la cuenta</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Image Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Imagen de perfil</h2>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 overflow-hidden">
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera size={40} />
              )}
            </div>
            <div>
              {/* Hidden file input */}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                className="hidden"
                accept="image/jpeg, image/png, image/jpg"
              />
              <button 
                type="button" 
                onClick={triggerFileInput} // Trigger file input on click
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cambiar imagen
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                JPG, JPEG, PNG. Máximo 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Username Section */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre de usuario
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Solo caracteres alfanuméricos en minúscula, puntos y guiones bajos (no consecutivos, ni al principio/final).
          </p>
        </div>

        {/* Full Name Section */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre completo
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Escribe un nombre..."
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white"
          />

        </div>

        {/* Academy Section */}
        <div>
          <label htmlFor="academy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Academia
          </label>
          <input
            type="text"
            name="academy"
            id="academy"
            value={academy}
            onChange={(e) => setAcademy(e.target.value)}
            placeholder="Nombre de tu academia"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white"
          />
        </div>

        {/* Bio Section */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <textarea
            name="bio"
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Escribe algo sobre ti..."
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Escribe una breve descripción de ti.
          </p>
        </div>

        {/* Subscription Management Section */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Suscripción</h3>
            {/* Placeholder for actual link to Stripe Customer Portal */}
            <a 
              href="#" 
              className="text-sm font-medium text-primary hover:text-primary-hover dark:text-primary-hover dark:hover:text-primary flex items-center"
            >
              Gestionar Suscripción <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          <div className="flex items-center space-x-2">
            {/* Placeholder data - replace with actual profile.subscription_status */}
            {true ? (
              <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100">
                Activa
              </span>
            ) : (
              <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100">
                Inactiva
              </span>
            )}
            {/* Placeholder data - replace with actual profile.subscription_type */}
            <span className="text-sm text-gray-600 dark:text-gray-400">Plan Premium</span> 
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Aquí podrás ver el estado de tu suscripción y realizar cambios.
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus dark:focus:ring-offset-gray-800 disabled:opacity-50"
            disabled={isSubmitting || (authLoading && !!profile)} // Disable if submitting or initial load with profile is ongoing
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Actualizar perfil'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPage; 