
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthErrorCodes
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleAuthError = (error: any) => {
    console.error(error);
    let title = "An unexpected error occurred.";
    let description = "Please try again.";

    switch (error.code) {
      case AuthErrorCodes.INVALID_EMAIL:
        title = "Invalid Email";
        description = "Please enter a valid email address.";
        break;
      case "auth/user-not-found":
      case AuthErrorCodes.USER_DELETED:
        title = "Account Not Found";
        description = "No account found with this email address.";
        break;
      case "auth/wrong-password":
      case AuthErrorCodes.INVALID_PASSWORD:
        title = "Incorrect Password";
        description = "The password you entered is incorrect. Please try again.";
        break;
      case AuthErrorCodes.EMAIL_EXISTS:
        title = "Email Already in Use";
        description = "An account already exists with this email. Please sign in.";
        break;
      case AuthErrorCodes.WEAK_PASSWORD:
        title = "Weak Password";
        description = "Your password must be at least 6 characters long.";
        break;
      default:
        // Keep generic message for other errors
        break;
    }

    toast({
      variant: "destructive",
      title: title,
      description: description,
    });
  }

  const handleLogin = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const newUser = userCredential.user;

      // Create a user document in Firestore
      await setDoc(doc(firestore, "users", newUser.uid), {
        email: newUser.email,
        tier: "FREE",
        createdAt: serverTimestamp(),
        conversationsToday: 0,
        streak: 0,
      });

      toast({
        title: "Sign Up Successful",
        description: "Your account has been created.",
      });
      // User will be redirected by the useEffect hook
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || user) {
    // Show a loading state while checking auth status or redirecting
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card className="glassmorphic shadow-2xl shadow-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Login</CardTitle>
              <CardDescription>
                Access your account to continue your practice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card className="glassmorphic shadow-2xl shadow-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Sign Up</CardTitle>
              <CardDescription>
                Create an account to start your English learning journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
