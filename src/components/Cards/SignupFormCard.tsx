import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { faker } from "@faker-js/faker"
import { useAuthSignIn, useAuthSignup } from "@/hooks/useCreateData"
import { EUrl, TUser } from "@/types"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/router"

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function SignupFormCard({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const router = useRouter();

  const { mutate: signInMutate, isPending: signInIsPending } = useAuthSignIn<{
    success: boolean;
    data: {
      user: TUser;
      token: string;
    };
    message: string;
  }>();

  const { mutate: signUpMutate, isPending: signUpIsPending } = useAuthSignup<{
    success: boolean;
    data: TUser;
    message: string;
  }>();


  const password = faker.internet.password({length: 7});


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: password,
      confirmPassword: password,
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    signUpMutate(
      {
        name: data.name,
        email: data.email,
        password: data.password
      },
      {
        onSuccess: (res) => {
          if(res && res.success && res.data){
            signInMutate(
              {
                email: data.email,
                password: data.password
              },
              {
                onSuccess: (res) => {
                  if(res && res.success && res.data){
                    localStorage.setItem('token', res.data.token);
                    console.log("Sign in successfull");
                    router.push(EUrl.BOARD);
                  }
                }
              }
            )
          }
        }
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input id="name" type="text" placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input id="email" type="email" placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>

                <Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input id="password" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm Password
                      </FieldLabel>
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input id="confirmPassword" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  </div>

                  <FieldDescription>
                    Must be at least 6 characters long.
                  </FieldDescription>
                </Field>

                <Field>
                  <Button type="submit" disabled={signUpIsPending || signInIsPending}>
                    {
                      (signInIsPending || signUpIsPending) ? (
                        <Loader2 className="animate-spin"/>
                      ) : (
                        'Create Account'
                      )
                    }
                  </Button>
                  <FieldDescription className="text-center">
                    Already have an account? <a href={EUrl.SIGNIN}>Sign in</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
