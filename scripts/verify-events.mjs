import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Calendar Events verification...");

  // Find or create a test user
  let user = await prisma.user.findFirst({
    where: { email: "demo@bucketlist.com" },
    include: { bucketItems: true },
  });

  if (!user) {
    console.log("Demo user not found, looking for any user...");
    user = await prisma.user.findFirst({
      include: { bucketItems: true },
    });
  }

  if (!user) {
    console.log("No user found, creating test user...");
    user = await prisma.user.create({
      data: {
        name: "Test Adventurer",
        email: `test-${Date.now()}@example.com`,
        passwordHash: "dummyhash123",
      },
      include: { bucketItems: true },
    });
  }

  console.log(`Using user: ${user.name} (${user.id})`);

  // Clean existing events for clean test
  await prisma.event.deleteMany({
    where: { userId: user.id },
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  console.log("Creating test events...");
  const event1 = await prisma.event.create({
    data: {
      userId: user.id,
      title: "Team Meeting",
      date: today,
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      location: "Bengaluru HQ",
      category: "Work",
      description: "Weekly sync and sprint planning.",
      reminder: "10_mins",
    },
  });

  const event2 = await prisma.event.create({
    data: {
      userId: user.id,
      title: "MLH Hackathon",
      date: tomorrow,
      startTime: "09:00 AM",
      endTime: "06:00 PM",
      location: "Bengaluru Tech Hub",
      category: "College",
      description: "Build something awesome with the team.",
      reminder: "1_day",
      bucketListItemId: user.bucketItems[0]?.id || null,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      userId: user.id,
      title: "Dinner with Friends",
      date: nextWeek,
      startTime: "07:30 PM",
      location: "Olive Bistro",
      category: "Social",
      reminder: "1_hour",
    },
  });

  console.log(`Created 3 events: "${event1.title}", "${event2.title}", "${event3.title}"`);

  // Verify querying
  const allEvents = await prisma.event.findMany({
    where: { userId: user.id },
  });
  console.log(`Total events found for user: ${allEvents.length} (Expected: 3)`);
  if (allEvents.length !== 3) throw new Error("Event count mismatch!");

  // Verify bucket list link
  if (user.bucketItems[0]) {
    const linked = await prisma.event.findFirst({
      where: { id: event2.id },
      include: { bucketListItem: true },
    });
    console.log(`Linked bucket list item verified: "${linked.bucketListItem?.title}"`);
  }

  // Verify update
  const updatedEvent = await prisma.event.update({
    where: { id: event1.id },
    data: { location: "Virtual (Google Meet)" },
  });
  console.log(`Updated Event 1 location: "${updatedEvent.location}"`);

  // Verify delete
  await prisma.event.delete({
    where: { id: event3.id },
  });
  const remaining = await prisma.event.count({ where: { userId: user.id } });
  console.log(`Events remaining after deletion: ${remaining} (Expected: 2)`);
  if (remaining !== 2) throw new Error("Delete failed!");

  // Verify tenant isolation
  const secondUser = await prisma.user.create({
    data: {
      name: "Other User",
      email: `other-${Date.now()}@example.com`,
      passwordHash: "dummyhash123",
    },
  });

  const otherUserEvents = await prisma.event.findMany({
    where: { userId: secondUser.id },
  });
  console.log(`Other user's events count: ${otherUserEvents.length} (Expected: 0)`);
  if (otherUserEvents.length !== 0) throw new Error("Isolation violation!");

  // Cleanup temporary second user
  await prisma.user.delete({ where: { id: secondUser.id } });

  console.log("✅ All Calendar Event database tests passed successfully!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

