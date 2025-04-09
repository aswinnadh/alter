"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";
import { toast } from "sonner";

import { checkoutCredits } from "@/lib/actions/transaction.action";

import { Button } from "../ui/button";

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      toast.success("Order placed!", {
        description: "You will receive an email confirmation",
        classNames: {
          toast: "bg-green-100 border-green-500 text-green-900",
          description: "text-green-800 text-sm",
          title: "font-semibold text-green-900",
        },
      });
    }

    if (query.get("canceled")) {
      toast.error("Order canceled!", {
        description: "Continue to shop around and checkout when you're ready",
        classNames: {
          toast: "bg-red-100 border-red-500 text-red-900",
          description: "text-red-800 text-sm",
          title: "font-semibold text-red-900",
        },
      });
    }
  }, []);

  const onCheckout = async () => {
    const transaction = {
      plan,
      amount,
      credits,
      buyerId,
    };

    await checkoutCredits(transaction);
  };

  return (
    <Button
      type="button"
      role="link"
      onClick={onCheckout}
      className="w-full rounded-full bg-purple-gradient bg-cover"
    >
      Buy Credit
    </Button>
  );
};

export default Checkout;
