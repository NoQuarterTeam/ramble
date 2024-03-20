import { stripe } from "@ramble/server-services"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const stripeRouter = createTRPCRouter({
  createPaymentIntent: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    })
    if (!user?.stripeCustomerId) throw new TRPCError({ code: "NOT_FOUND", message: "Stripe customer not found" })

    // const ephemeralKey = await stripe.ephemeralKeys.create(
    // 	{customer: user.stripeCustomerId},
    // );
    // const paymentIntent = await stripe.paymentIntents.create({

    // 	customer: user.stripeCustomerId,
    // 	// In the latest version of the API, specifying the `automatic_payment_methods` parameter
    // 	// is optional because Stripe enables its functionality by default.
    // 	automatic_payment_methods: {
    // 		enabled: true,
    // 	},
    // });
  }),
})
