import readline from "readline"
import { prisma } from "@ramble/database"

export function uniq(a: any[]) {
  return Array.from(new Set(a))
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

export async function confirmDeleteSpots(spotsToDelete: string[]) {
  console.log("Spots to delete: " + spotsToDelete.map(id => " https://ramble.guide/spots/" + id))
  const answer = await askQuestion('Are you sure you want to delete? (yes/no) ');
  if (answer === 'yes') {
    console.log('Continuing...');
    try {
      // Remove any spots that are no longer on the source
      const deleted = await prisma.spot.updateMany({
        where: { id: { in: spotsToDelete }, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      console.log("Deleted " + deleted.count + " spots");
    } catch (error) {
      console.error("Error deleting spots:", error);
    }
  } else {
    console.log('Aborted.');
  }

  rl.close();
}


// Define a function to check the status of an image URL using fetch
export async function checkImageStatus(imageUrl: string) {
  try {
    const response = await fetch(imageUrl); // Send a HEAD request to get just the headers
    return response.ok; // Check if the response is okay (status code 200-299)
  } catch (error) {
    return false; // Return false if any error occurs (including 404)
  }
}
