import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding demo account and sample bucket list data...");

  // Delete existing demo user if present
  const existingDemo = await prisma.user.findUnique({
    where: { email: "demo@bucketlist.com" },
  });

  if (existingDemo) {
    await prisma.user.delete({
      where: { id: existingDemo.id },
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  const demoUser = await prisma.user.create({
    data: {
      name: "Alex Carter",
      email: "demo@bucketlist.com",
      passwordHash,
      categories: {
        create: [
          {
            name: "Travel",
            description: "Places to explore, cultures to experience, and journeys across the globe.",
            color: "sky",
            icon: "plane",
          },
          {
            name: "Experiences",
            description: "Unforgettable moments, adventures, and meaningful life stories.",
            color: "amber",
            icon: "sparkles",
          },
          {
            name: "Life",
            description: "Core aspirations, wisdom, relationships, and major personal milestones.",
            color: "rose",
            icon: "heart",
          },
          {
            name: "Skills",
            description: "Talents to master, crafts to learn, languages, and instruments.",
            color: "indigo",
            icon: "lightbulb",
          },
          {
            name: "Career",
            description: "Professional ambitions, creative ventures, and impactful achievements.",
            color: "emerald",
            icon: "briefcase",
          },
          {
            name: "Fitness",
            description: "Health milestones, outdoor endurance, and physical strength challenges.",
            color: "teal",
            icon: "activity",
          },
          {
            name: "Money",
            description: "Financial freedom goals, investments, and dream purchases.",
            color: "yellow",
            icon: "coins",
          },
        ],
      },
    },
    include: {
      categories: true,
    },
  });

  const getCatId = (name) => demoUser.categories.find((c) => c.name === name)?.id;

  const sampleGoals = [
    // Travel
    {
      title: "Travel to Japan during cherry blossom season",
      categoryId: getCatId("Travel"),
      description: "Explore the ancient temples of Kyoto, wander through bamboo groves in Arashiyama, and experience the energy of Tokyo.",
      completed: true,
      completedAt: new Date("2026-04-12"),
      reflection: "I finally visited Japan with my closest friends. Seeing Kyoto during peak sakura season was one of the most serene and beautiful experiences of my life.",
    },
    {
      title: "See the Northern Lights in Tromsø, Norway",
      categoryId: getCatId("Travel"),
      description: "Stay in a glass igloo and watch the aurora borealis illuminate the Arctic sky.",
      completed: true,
      completedAt: new Date("2026-01-20"),
      reflection: "Standing under the dancing green curtains of light in minus 15 degrees Celsius felt surreal. A core memory forever.",
    },
    {
      title: "Hike the Inca Trail to Machu Picchu",
      categoryId: getCatId("Travel"),
      description: "4-day trek through the Andes mountains arriving at the Sun Gate at dawn.",
      completed: false,
    },
    {
      title: "Road trip along California's Pacific Coast Highway",
      categoryId: getCatId("Travel"),
      description: "Drive from San Francisco to San Diego via Big Sur in a convertible.",
      completed: false,
    },

    // Experiences
    {
      title: "Go hot air ballooning over Cappadocia at sunrise",
      categoryId: getCatId("Experiences"),
      description: "Float above the fairy chimneys and surreal valley landscapes of Turkey.",
      completed: true,
      completedAt: new Date("2025-09-18"),
      reflection: "Waking up at 4:30 AM was worth every second. Looking down at hundreds of colorful balloons in the morning golden hour was breathtaking.",
    },
    {
      title: "Attend a live orchestra performing Beethoven's Symphony No. 9",
      categoryId: getCatId("Experiences"),
      description: "Experience Ode to Joy performed live in a historic symphony hall.",
      completed: false,
    },
    {
      title: "Spend a week completely offline in a mountain cabin",
      categoryId: getCatId("Experiences"),
      description: "No internet, no notifications. Just reading, walking in nature, and silence.",
      completed: false,
    },

    // Life
    {
      title: "Build something I am deeply proud of",
      categoryId: getCatId("Life"),
      description: "Create a meaningful project or craft that helps people and stands the test of time.",
      completed: true,
      completedAt: new Date("2026-08-10"),
      reflection: "Launched my open-source project and reached thousands of people. It proved to me that perseverance and genuine care make all the difference.",
    },
    {
      title: "Read 100 classic books",
      categoryId: getCatId("Life"),
      description: "From philosophy to epic literature across centuries.",
      completed: false,
    },

    // Skills
    {
      title: "Learn conversational Japanese",
      categoryId: getCatId("Skills"),
      description: "Be able to comfortably order food, navigate towns, and hold daily conversations.",
      completed: true,
      completedAt: new Date("2026-03-01"),
      reflection: "Studied for an hour each morning for 8 months. Speaking with local shop owners in Osaka was tremendously rewarding.",
    },
    {
      title: "Learn to play Ludovico Einaudi's 'Nuvole Bianche' on piano",
      categoryId: getCatId("Skills"),
      description: "Master both hands and play smoothly without sheet music.",
      completed: false,
    },

    // Fitness
    {
      title: "Run a half marathon (21.1 km)",
      categoryId: getCatId("Fitness"),
      description: "Train consistently for 16 weeks and finish under 2 hours.",
      completed: true,
      completedAt: new Date("2025-11-05"),
      reflection: "Crossed the finish line at 1:52:14. The last 3 kilometers pushed my mental limits, but hearing the crowd cheering made it unforgettable.",
    },
    {
      title: "Complete a 100 km cycling tour",
      categoryId: getCatId("Fitness"),
      description: "Scenic coastal ride with elevation gain.",
      completed: false,
    },

    // Career
    {
      title: "Mentor 5 aspiring developers and designers",
      categoryId: getCatId("Career"),
      description: "Help junior peers break into tech and build confidence.",
      completed: true,
      completedAt: new Date("2026-06-15"),
      reflection: "Seeing my mentees land their first dream jobs was one of the most fulfilling milestones of my career.",
    },
    {
      title: "Speak at an international technology conference",
      categoryId: getCatId("Career"),
      description: "Deliver a keynote or technical talk in front of a live audience.",
      completed: false,
    },

    // Money
    {
      title: "Save ₹1,00,000 for an emergency freedom fund",
      categoryId: getCatId("Money"),
      description: "A solid cushion that gives peace of mind and flexibility.",
      completed: true,
      completedAt: new Date("2025-08-30"),
      reflection: "Automated monthly savings and avoided impulse spending. Having financial safety brought tremendous peace of mind.",
    },
    {
      title: "Build a diversified long-term investment portfolio",
      categoryId: getCatId("Money"),
      description: "Index funds, mutual funds, and long-term assets.",
      completed: false,
    },
  ];

  for (const g of sampleGoals) {
    if (g.categoryId) {
      await prisma.bucketListItem.create({
        data: {
          userId: demoUser.id,
          categoryId: g.categoryId,
          title: g.title,
          description: g.description,
          completed: g.completed,
          completedAt: g.completedAt || null,
          reflection: g.reflection || null,
        },
      });
    }
  }

  console.log(`✅ Seed completed! Created ${sampleGoals.length} sample goals for demo@bucketlist.com.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

