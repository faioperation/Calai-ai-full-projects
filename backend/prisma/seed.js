import prisma from "../src/app/prisma/client.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password
  const hashedPassword = await bcrypt.hash("123456", 10);

  // 1. Create/Update System Owner
  const systemOwner = await prisma.user.upsert({
    where: { email: "system@test.com" },
    update: {
      firstName: "System",
      lastName: "Owner",
      password: hashedPassword,
      role: "SYSTEM_OWNER",
      status: "active",
      isVerified: true,
    },
    create: {
      firstName: "System",
      lastName: "Owner",
      email: "system@test.com",
      password: hashedPassword,
      role: "SYSTEM_OWNER",
      status: "active",
      isVerified: true,
    },
  });
  console.log(`✅ System Owner: ${systemOwner.email}`);

  // 2. Create/Update Business Owner
  const businessOwner = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {
      firstName: "Business",
      lastName: "Owner",
      password: hashedPassword,
      role: "BUSINESS_OWNER",
      status: "active",
      isVerified: true,
    },
    create: {
      firstName: "Business",
      lastName: "Owner",
      email: "user@test.com",
      password: hashedPassword,
      role: "BUSINESS_OWNER",
      status: "active",
      isVerified: true,
    },
  });
  console.log(`✅ Business Owner: ${businessOwner.email}`);

  // 3. Create/Update Business for the Business Owner
  const businessName = "New business";
  const businessAddress = "Dhaka, Banglasesh";

  let business = await prisma.business.findFirst({
    where: { ownerId: businessOwner.id },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        name: businessName,
        ownerId: businessOwner.id,
        status: "active",
      },
    });
    console.log(`✅ Business created: ${business.name}`);
  } else {
    business = await prisma.business.update({
      where: { id: business.id },
      data: { name: businessName },
    });
    console.log(`✅ Business updated: ${business.name}`);
  }

  // 4. Create/Update Business Settings
  await prisma.businessSetting.upsert({
    where: { businessId: business.id },
    update: {
      businessName: businessName,
      businessAddress: businessAddress,
    },
    create: {
      businessId: business.id,
      businessName: businessName,
      businessAddress: businessAddress,
    },
  });
  console.log(`✅ Business Settings updated`);

  // 5. Create Subscription Plans
  const plans = [
    {
      name: "Free Trial",
      priceMonthly: 0.0,
      priceYearly: 0.0,
      callMinutesLimit: 10,
      aiMinutesLimit: 10,
      forwardedMinutesLimit: 0,
      agentLimit: 1,
      onboardingFee: 0.0,
      callCountLimit: 0,
      messageLimit: 0,
      features: [
        "1 AI Agent",
        "10 AI minutes",
        "Test your AI assistant",
        "Full dashboard access",
        "No payment required",
      ],
      stripeMonthlyPriceId: "price_1TX0hQHcy9TCZulnCi69ld7w",
      stripeYearlyPriceId: null,
    },
    {
      name: "Starter",
      priceMonthly: 49.0,
      priceYearly: 490.0,
      callMinutesLimit: 350,
      aiMinutesLimit: 150,
      forwardedMinutesLimit: 200,
      agentLimit: 1,
      onboardingFee: 79.0,
      callCountLimit: 0,
      messageLimit: 0,
      features: [
        "1 AI Agent",
        "150 AI minutes",
        "200 forwarded minutes",
        "Full Calai platform",
        "AI order taking & call handling",
        "Receipt printer functionality",
        "Full dashboard & analytics",
        "£79 one-time onboarding",
      ],
      stripeMonthlyPriceId: "price_1Tq2I8Hcy9TCZulnefpGkYqX",
      stripeYearlyPriceId: "price_starter_yearly_placeholder",
    },
    {
      name: "Growth",
      priceMonthly: 99.0,
      priceYearly: 990.0,
      callMinutesLimit: 650,
      aiMinutesLimit: 300,
      forwardedMinutesLimit: 350,
      agentLimit: 1,
      onboardingFee: 79.0,
      callCountLimit: 0,
      messageLimit: 0,
      features: [
        "1 AI Agent",
        "300 AI minutes",
        "350 forwarded minutes",
        "Full Calai platform",
        "AI order taking & call handling",
        "Receipt printer functionality",
        "Full dashboard & analytics",
        "£79 one-time onboarding",
      ],
      stripeMonthlyPriceId: "price_1TX0i0Hcy9TCZulnVSa0ijWg",
      stripeYearlyPriceId: "price_growth_yearly_placeholder",
    },
    {
      name: "Pro",
      priceMonthly: 149.0,
      priceYearly: 1490.0,
      callMinutesLimit: 1100,
      aiMinutesLimit: 500,
      forwardedMinutesLimit: 600,
      agentLimit: 5,
      onboardingFee: 0.0,
      callCountLimit: 0,
      messageLimit: 0,
      features: [
        "Multiple AI Agents",
        "500 AI minutes",
        "600 forwarded minutes",
        "Full Calai platform",
        "AI order taking & call handling",
        "Receipt printer functionality",
        "Full dashboard & analytics",
        "No onboarding fee",
      ],
      stripeMonthlyPriceId: "price_1Tq3aCHcy9TCZuln0eXIcC4X",
      stripeYearlyPriceId: "price_pro_yearly_placeholder",
    },
    {
      name: "Enterprise",
      priceMonthly: 0.0, // Custom pricing
      priceYearly: 0.0,
      callMinutesLimit: 9999,
      aiMinutesLimit: 9999,
      forwardedMinutesLimit: 9999,
      agentLimit: 10,
      onboardingFee: 0.0,
      callCountLimit: 0,
      messageLimit: 0,
      features: [
        "Multiple AI Agents",
        "Custom AI minute allowance",
        "Custom forwarded minute allowance",
        "Multiple locations",
        "Custom business requirements",
        "Volume pricing",
      ],
      stripeMonthlyPriceId: null,
      stripeYearlyPriceId: null,
    },
  ];

  for (const planData of plans) {
    await prisma.plan.upsert({
      where: { name: planData.name },
      update: planData,
      create: planData,
    });
  }
  console.log("✅ Subscription Plans created/updated");

  console.log("🚀 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
