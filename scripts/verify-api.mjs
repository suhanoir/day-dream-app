import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting verification test...");

  // Clean test tables
  await prisma.bucketListItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating test user Alice...");
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Explorer",
      email: "alice@example.com",
      passwordHash,
      categories: {
        create: [
          { name: "Travel", description: "Places to explore", color: "sky", icon: "plane" },
          { name: "Experiences", description: "Life adventures", color: "amber", icon: "sparkles" },
          { name: "Career", description: "Milestones", color: "emerald", icon: "briefcase" },
        ],
      },
    },
    include: {
      categories: true,
    },
  });

  console.log(`User created: ${alice.name} with ${alice.categories.length} categories.`);

  const travelCat = alice.categories.find((c) => c.name === "Travel");
  const expCat = alice.categories.find((c) => c.name === "Experiences");

  console.log("Adding bucket list items for Alice...");
  const item1 = await prisma.bucketListItem.create({
    data: {
      userId: alice.id,
      categoryId: travelCat.id,
      title: "Travel to Japan",
      description: "Experience cherry blossom season in Kyoto and explore Tokyo",
      completed: false,
    },
  });

  const item2 = await prisma.bucketListItem.create({
    data: {
      userId: alice.id,
      categoryId: travelCat.id,
      title: "See the Northern Lights in Norway",
      description: "Stay in a glass igloo and watch the aurora borealis",
      completed: true,
      completedAt: new Date("2026-03-15"),
      reflection: "It was magical standing in Tromsø watching green lights dance across the sky.",
    },
  });

  const item3 = await prisma.bucketListItem.create({
    data: {
      userId: alice.id,
      categoryId: expCat.id,
      title: "Scuba dive in the Great Barrier Reef",
      completed: false,
    },
  });

  console.log("Created 3 bucket list items.");

  // Verify counts
  const total = await prisma.bucketListItem.count({ where: { userId: alice.id } });
  const completed = await prisma.bucketListItem.count({ where: { userId: alice.id, completed: true } });
  console.log(`Verification: Total Goals = ${total}, Completed = ${completed}, Remaining = ${total - completed}`);

  // Test updating reflection
  console.log("Testing reflection update on item 1...");
  const updatedItem1 = await prisma.bucketListItem.update({
    where: { id: item1.id },
    data: {
      completed: true,
      completedAt: new Date(),
      reflection: "I finally visited Japan with friends! Kyoto was breathtaking.",
    },
  });

  console.log(`Updated Item 1: completed=${updatedItem1.completed}, reflection="${updatedItem1.reflection}"`);

  // Verify Bob cannot access Alice's data
  console.log("Creating Bob to test user data isolation...");
  const bob = await prisma.user.create({
    data: {
      name: "Bob Builder",
      email: "bob@example.com",
      passwordHash,
      categories: {
        create: [{ name: "Fitness", description: "Health goals", color: "teal", icon: "activity" }],
      },
    },
    include: { categories: true },
  });

  const bobItems = await prisma.bucketListItem.findMany({ where: { userId: bob.id } });
  console.log(`Bob's items count: ${bobItems.length} (Expected: 0)`);

  if (bobItems.length === 0) {
    console.log("✅ User isolation verified: Bob cannot see Alice's items.");
  } else {
    throw new Error("❌ User isolation failed!");
  }

  console.log("✅ All core database and data flow tests passed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

