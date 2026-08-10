import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Mail, Lock, Camera, Loader2, User } from "lucide-react";
import InputField from "../../../components/Inputfield";
import Password from "../../../components/Password";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import toast from "react-hot-toast";

const ProfileSettings = () => {
  const axiosSecure = useAxiosSecure();
  const { setUser } = useAuth();

  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fileInputRef = useRef(null);

  // Fetch Profile data
  const {
    data: profileResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["ownerProfile"],
    queryFn: async () => {
      const response = await axiosSecure.get(
        "/business-owner/settings/my-profile",
      );
      return response.data;
    },
  });

  // Helper to get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http") || avatarPath.startsWith("blob:"))
      return avatarPath;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const baseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
    return `${baseUrl}/${avatarPath.replace(/^\//, "")}`;
  };

  // Sync profile data to state
  useEffect(() => {
    if (profileResponse?.data && !isProfileEditing) {
      setFirstName(profileResponse.data.firstName || "");
      setLastName(profileResponse.data.lastName || "");
      setEmail(profileResponse.data.email || "");
      setProfileImage(getAvatarUrl(profileResponse.data.avatar));
      setSelectedFile(null);
    }
  }, [profileResponse, isProfileEditing]);

  const currentAvatarUrl = profileResponse?.data?.avatar
    ? getAvatarUrl(profileResponse.data.avatar)
    : null;
  const { data: avatarBlobUrl } = useQuery({
    queryKey: ["owner-avatar-image", currentAvatarUrl],
    enabled: !!currentAvatarUrl && !currentAvatarUrl.startsWith("blob:"),
    queryFn: async () => {
      const res = await axios.get(currentAvatarUrl, {
        responseType: "blob",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      return URL.createObjectURL(res.data);
    },
  });

  const displayImage = selectedFile
    ? profileImage
    : avatarBlobUrl || profileImage;

  const handleImageClick = () => {
    if (isProfileEditing && !updateMutation.isPending) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  // Mutation for updating profile
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      let payload;
      let headers = {};
      if (selectedFile) {
        payload = new FormData();
        payload.append("first_name", data.firstName);
        payload.append("last_name", data.lastName);
        payload.append("avatar", selectedFile);
      } else {
        payload = {
          first_name: data.firstName,
          last_name: data.lastName,
        };
      }
      const response = await axiosSecure.patch(
        "/business-owner/settings/update-profile",
        payload,
        { headers },
      );
      return response.data;
    },
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message || "Profile updated successfully");
        if (res?.data) {
          localStorage.setItem("user", JSON.stringify(res.data));
          setUser(res.data);
        }
        setIsProfileEditing(false);
        refetch();
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "An error occurred during update",
      );
    },
  });

  const handleSaveProfile = () => {
    if (!firstName || !lastName) {
      toast.error("First Name and Last Name are required");
      return;
    }
    updateMutation.mutate({ firstName, lastName });
  };

  // Mutation for changing password
  const changePasswordMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosSecure.post("/auth/change-password", payload);
      return response.data;
    },
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message || "Password changed successfully");
        handleCancelPassword();
      } else {
        toast.error(res?.message || "Failed to change password");
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "An error occurred",
      );
    },
  });

  const handleCancelPassword = () => {
    setIsPasswordEditing(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#2563EB] w-10 h-10" />
      </div>
    );
  }

  const isProfilePending = updateMutation.isPending;
  const isPasswordPending = changePasswordMutation.isPending;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-semibold text-white mb-1">
        Profile Settings
      </h2>
      <p className="text-sm text-gray-400 mb-8">
        Update your personal information
      </p>

      <div className="bg-[#191919] p-6 rounded-xl border border-white/5 mb-8">
        {/* Profile Image */}
        <div className="relative w-20 h-20 mb-8">
          {displayImage ? (
            <img
              src={displayImage}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-2 border-white/10"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[#1C2242] flex items-center justify-center border-2 border-white/10">
              <User className="text-gray-400 w-8 h-8" />
            </div>
          )}
          {isProfileEditing && (
            <button
              onClick={handleImageClick}
              disabled={isProfilePending}
              className="absolute bottom-0 right-0 bg-[#252525] p-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <InputField
            label="First Name"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            readOnly={!isProfileEditing || isProfilePending}
            labelClass="!text-sm !font-medium !text-gray-300"
            inputClass={`!bg-[#111111] !border-white/5 !rounded-full !px-5 !py-3.5 !text-sm ${!isProfileEditing || isProfilePending ? "!text-gray-500 cursor-default" : "!text-white"} placeholder:!text-gray-600 focus:!outline-none focus:!border-blue-500/50`}
          />
          <InputField
            label="Last Name"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            readOnly={!isProfileEditing || isProfilePending}
            labelClass="!text-sm !font-medium !text-gray-300"
            inputClass={`!bg-[#111111] !border-white/5 !rounded-full !px-5 !py-3.5 !text-sm ${!isProfileEditing || isProfilePending ? "!text-gray-500 cursor-default" : "!text-white"} placeholder:!text-gray-600 focus:!outline-none focus:!border-blue-500/50`}
          />
        </div>

        <div className="mb-8">
          <InputField
            label="Email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={true}
            leftIcon={<Mail className="w-4 h-4" />}
            labelClass="!text-sm !font-medium !text-gray-300"
            inputClass="!bg-[#111111] !border-white/5 !rounded-full !pl-12 !pr-5 !py-3.5 !text-sm !text-gray-500 cursor-not-allowed placeholder:!text-gray-600 focus:!outline-none focus:!border-transparent"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          {!isProfileEditing ? (
            <button
              onClick={() => setIsProfileEditing(true)}
              className="px-10 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all cursor-pointer"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsProfileEditing(false)}
                disabled={isProfilePending}
                className="px-8 py-2.5 rounded-full border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isProfilePending}
                className="px-8 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProfilePending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Change Password */}
      <h2 className="text-xl font-semibold text-white mb-1">Change Password</h2>
      <p className="text-sm text-gray-400 mb-8">
        Update your password regularly to keep your account secure.
      </p>

      <div className="bg-[#191919] p-6 rounded-xl border border-white/5 mb-8">
        <div className="mb-6">
          <Password
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            readOnly={!isPasswordEditing || isPasswordPending}
            leftIcon={<Lock className="w-4 h-4" />}
            labelClass="!text-sm !font-medium !text-gray-300"
            inputClass={`!bg-[#111111] !border-white/5 !rounded-full !pl-12 !pr-5 !py-3.5 !text-sm ${!isPasswordEditing || isPasswordPending ? "!text-gray-500 cursor-default" : "!text-white"} placeholder:!text-gray-600 focus:!outline-none focus:!border-blue-500/50`}
            icon="!text-gray-400 hover:!text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Password
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            readOnly={!isPasswordEditing || isPasswordPending}
            leftIcon={<Lock className="w-4 h-4" />}
            labelClass="!text-sm !font-medium !text-gray-300"
            inputClass={`!bg-[#111111] !border-white/5 !rounded-full !pl-12 !pr-5 !py-3.5 !text-sm ${!isPasswordEditing || isPasswordPending ? "!text-gray-500 cursor-default" : "!text-white"} placeholder:!text-gray-600 focus:!outline-none focus:!border-blue-500/50`}
            icon="!text-gray-400 hover:!text-white"
          />
          <Password
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            readOnly={!isPasswordEditing || isPasswordPending}
            leftIcon={<Lock className="w-4 h-4" />}
            labelClass="!text-sm !font-medium !text-gray-300"
            inputClass={`!bg-[#111111] !border-white/5 !rounded-full !pl-12 !pr-5 !py-3.5 !text-sm ${!isPasswordEditing || isPasswordPending ? "!text-gray-500 cursor-default" : "!text-white"} placeholder:!text-gray-600 focus:!outline-none focus:!border-blue-500/50`}
            icon="!text-gray-400 hover:!text-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          {!isPasswordEditing ? (
            <button
              onClick={() => setIsPasswordEditing(true)}
              className="px-10 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all cursor-pointer"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelPassword}
                disabled={isPasswordPending}
                className="px-8 py-2.5 rounded-full border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                disabled={isPasswordPending}
                className="px-8 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPasswordPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save new password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
