"use client";
import { Card } from "@/components/ui/card";
import { AccountProps } from "@/types";
import Image from "next/image";
import React, { ChangeEvent, useRef, useState, useEffect } from "react";
import profileIcon from "@/assets/profile.png";
import {
  AlertTriangle,
  Briefcase,
  Camera,
  CheckCircle2,
  Crown,
  Edit,
  FileText,
  Mail,
  NotepadText,
  Phone,
  PhoneIcon,
  RefreshCcw,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAppData } from "@/context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { useRouter } from "next/navigation";

const Info: React.FC<AccountProps> = ({ user, isYourAccount }) => {
  const [isMounted, setIsMounted] = useState(false);

  const [uploadingPic, setUploadingPic] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const editRef = useRef<HTMLButtonElement | null>(null);
  const resumeRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const { updateProfilePic, updateResume, btnLoading, updateUser } =
    useAppData();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleEditClick = () => {
    editRef.current?.click();
    setName(user.name);
    setPhoneNumber(user.phone_number);
    setBio(user.bio || "");
  };

  const changeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploadingPic(true);
      const formData = new FormData();
      formData.append("file", file);
      await updateProfilePic(formData);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingPic(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const updateProfileHandler = () => {
    updateUser(name, phoneNumber, bio);
  };

  const changeResume = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please Upload a PDF File");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    updateResume(formData);
  };

  const handleResumeClick = () => {
    resumeRef.current?.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="overflow-hidden shadow-lg border-2">
        <div className="h-32 bg-blue-500 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden shadow-xl bg-background relative">
                <Image
                  src={user.profile_pic ? user.profile_pic : profileIcon}
                  alt="Profile picture"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  priority
                  unoptimized={!!user.profile_pic}
                />

                {isMounted && uploadingPic && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {isMounted && isYourAccount && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleClick}
                    disabled={uploadingPic}
                    className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg cursor-pointer"
                  >
                    <Camera size={18} />
                  </Button>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={inputRef}
                    onChange={changeHandler}
                    disabled={uploadingPic}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* main Content */}
        <div className="pt-20 pb-8 px-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                {isYourAccount && (
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="h-8 w-8"
                    onClick={handleEditClick}
                  >
                    <Edit size={16} />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Briefcase size={16} />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {user.role === "jobseeker" && user.bio && (
            <div className="mt-6 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium opacity-70">
                <FileText size={16} />
                <span>About</span>
              </div>
              <p className="text-base leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail size={20} className="text-blue-600" />
              Contact Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sx opacity-70 font-medium">Email</p>
                  <p className="text-sm truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sx opacity-70 font-medium">Phone</p>
                  <p className="text-sm truncate">{user.phone_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resume */}
          {user.role === "jobseeker" && user.resume && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mt-4 flex items-center gap-2">
                <NotepadText size={20} className="text-blue-600" /> Resume
              </h2>

              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <NotepadText size={20} className="text-red-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">Resume Document</p>
                  <Link
                    href={user.resume}
                    className="text-sm text-blue-500 hover:underline"
                    target="_blank"
                  >
                    View Resume PDF
                  </Link>
                </div>

                {isYourAccount && (
                  <div>
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      onClick={handleResumeClick}
                      className="gap-2"
                    >
                      Update
                    </Button>
                    <input
                      type="file"
                      ref={resumeRef}
                      className="hidden"
                      accept="application/pdf"
                      onChange={changeResume}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscription Section */}
          {isYourAccount && user.role === "jobseeker" && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mt-4 flex items-center gap-2">
                <Crown size={20} className="text-blue-600" />
                Subscription Status
              </h2>

              <div className="p-6 rounded-lg bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-950/20">
                {!user.subscription ? (
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-semibold text-lg mb-1">
                        No Active Subscription
                      </p>
                      <p className="text-sm opacity-70">
                        Subscribe To Unlock Premium Features And Benefits
                      </p>
                    </div>
                    <Button
                      className="gap-2"
                      onClick={() => router.push("/subscribe")}
                    >
                      <Crown size={18} /> Subscribe Now
                    </Button>
                  </div>
                ) : new Date(user.subscription).getTime() > Date.now() ? (
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2
                          size={20}
                          className="text-green-600"
                        />
                        <p className="font-semibold text-lg text-green-600">
                          Active Subscription
                        </p>
                      </div>

                      <p className="text-sm opacity-70">
                        valid until:{" "}
                        {new Date(user.subscription).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-700 text-white font-medium">
                      <CheckCircle2 size={18} />
                      Subscribed
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={20} className="text-red-600" />
                        <p className="font-semibold text-lg text-red-600">
                          Subscription Expired
                        </p>
                      </div>
                      <p className="text-sm opacity-70">Expired On: {" "}
                        {new Date(user.subscription).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <Button variant={"destructive"} className="gap-2" onClick={()=>router.push("/subscribe")}>
                      <RefreshCcw size={18} /> Renew Subscription
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button ref={editRef} value={"outline"} className="hidden">
            Edit Profile
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserIcon size={16} /> Full Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <PhoneIcon size={16} /> Phone
              </Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            {user.role === "jobseeker" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText size={16} /> Bio
                </Label>
                <Input value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            )}

            <DialogFooter>
              <Button
                disabled={btnLoading}
                onClick={updateProfileHandler}
                className="w-full"
              >
                {btnLoading ? "Saving Changes..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Info;
