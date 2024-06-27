import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function fetchAllPhotos(collectionId: string, clientId: string) {
  let page = 1;
  const perPage = 30; // You can adjust this number to fetch more photos per page
  let allPhotos: any[] = [];
  let hasMorePhotos = true;

  while (hasMorePhotos) {
    const response = await fetch(`https://api.unsplash.com/collections/${collectionId}/photos?client_id=${clientId}&page=${page}&per_page=${perPage}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const photos = await response.json();
    allPhotos = allPhotos.concat(photos);
    if (photos.length < perPage) {
      hasMorePhotos = false; // If less than `perPage` photos are returned, we have reached the end
    }
    page += 1;
  }
  
  return allPhotos;
}

async function downloadImages(rawData: any[]) {
  const dirPath = "./unsplash-images";

  // Create the directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  for (const data of rawData) {
    const imageURL = data.urls.full;
    const fileName = `${data.id}.jpg`;

    try {
      const response = await fetch(imageURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(path.join(dirPath, fileName), buffer);
      console.log(`Image ${data.id} downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading image ${data.id}:`, error);
    }
  }
}

const clientId = 'vzdmAauo__yVcHv4Nf8hq1ftJ68qtjKNeJ4e91i2um8';
const collectionId = 'E4vprEtnKCU';

fetchAllPhotos(collectionId, clientId)
  .then(downloadImages)
  .catch(error => {
    console.error('Error fetching photos:', error);
  });
