"use client";

import { useState } from "react";
import { User, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { updateProfileSettings, deleteAccount } from "./actions";
import { toast } from "sonner";

export function SettingsForm({ initialProfile, userEmail }: { initialProfile: any, userEmail: string }) {
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  async function handleSave(formData: FormData) {
    setIsPending(true);
    const result = await updateProfileSettings(formData);
    setIsPending(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Settings updated successfully");
    }
  }

  async function handleDelete() {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    setIsDeleting(true);
    const result = await deleteAccount();
    if (result?.error) {
      setIsDeleting(false);
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-8">
      <form action={handleSave} className="space-y-8">
        
        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">This information will be displayed publicly depending on your privacy settings.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  id="full_name" 
                  name="full_name" 
                  defaultValue={initialProfile.full_name} 
                  required
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">@</span>
                  <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    defaultValue={initialProfile.username || ""} 
                    placeholder="johndoe"
                    className="w-full pl-8 p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <input 
                type="text" 
                disabled 
                defaultValue={userEmail} 
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Your email address cannot be changed right now.</p>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Privacy Settings</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">Control how your activity appears to others on the platform.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <label className="flex items-start gap-4 cursor-pointer p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center h-6">
                <input 
                  type="checkbox" 
                  name="is_profile_public" 
                  defaultChecked={initialProfile.is_profile_public} 
                  className="w-5 h-5 text-primary bg-white border-slate-300 rounded focus:ring-primary"
                />
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">Public Profile</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400 mt-1">Allow your username and avatar to appear when you comment on posts or interact with the community.</span>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center h-6">
                <input 
                  type="checkbox" 
                  name="show_donations_publicly" 
                  defaultChecked={initialProfile.show_donations_publicly} 
                  className="w-5 h-5 text-primary bg-white border-slate-300 rounded focus:ring-primary"
                />
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">Show Donations on Donor Walls</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400 mt-1">If unchecked, your donations will always appear as "Anonymous" on masjid project pages, even if you are logged in.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Deleting your account is permanent. All your profile data, comments, likes, and followed masjids will be instantly and irreversibly erased. However, your past financial donations will be retained anonymously for accounting purposes.
          </p>
          <div className="flex items-end gap-4 max-w-md">
            <div className="flex-1 space-y-2">
              <label htmlFor="deleteConfirm" className="text-sm font-medium text-slate-700 dark:text-slate-300">Type DELETE to confirm</label>
              <input 
                type="text" 
                id="deleteConfirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all dark:text-white"
              />
            </div>
            <button 
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || deleteConfirmation !== "DELETE"}
              className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[46px]"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
