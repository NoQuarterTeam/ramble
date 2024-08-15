import { prisma } from "@ramble/database"
import { generateBlurHash } from "@ramble/server-services"

// PROD DATA @ 17th June
const SPOT_DATA = [
  {
    id: "03ecf4d0-f879-486d-8607-867306e482c1",
    name: "Rapoća Camping Village",
    description:
      "Camp Rapoća Camping Village is located on the island of Lošinj and situated in the village of Nerezine. A three star campsite, Rapoća can be found right at the entrance to Nerezine, and is mainly surrounded by pine trees.",
    images: [
      "https://www.camping.hr/cmsmedia/katalog/174/100-camp-rapoca-panoramic-view.jpg",
      "https://www.camping.hr/cmsmedia/katalog/174/110-camp-rapoca-panoramic-view.jpg",
      "https://www.camping.hr/cmsmedia/katalog/174/210-camp-rapoca-pitches.jpg",
    ],
  },
  {
    id: "05aee80b-ccea-437c-82de-137ee50b1f1d",
    name: "La Ferme du Devès",
    description:
      "Under the large beech trees, the Peasant Welcome Table based on the products of the farm or neighbouring farms. Our stopover and stay cottage to recharge your batteries in direct contact with flower fields, animals, forests and streams, with 3 independent dormitories and a double bedroom. Common kitchen, dining room and living room. Outside, several dining areas and a summer guinguette area.",
    images: [
      "https://media.catalogue.accueil-paysan.com/photos/activity-7454_15.jpg.670x500_q85_crop.jpg",
      "https://media.catalogue.accueil-paysan.com/photos/activity-7453_3.jpg.670x500_q85_crop.jpg",
      "https://media.catalogue.accueil-paysan.com/photos/activity-13186_4.jpg.670x500_q85_crop.jpg",
    ],
  },
  {
    id: "08708c6b-c275-47be-a2dc-3039eb555afb",
    name: "Camp Buk",
    description:
      "Camp Buk, situated in the heart of National Park Una. The camp covers an area of 10 000m² by the river Una. Within the camp there is a restaurant with domestic bosnian cuisine, grill and cafe with a large terrace.",
    images: [
      "http://camp-buk.ba/images/naslovna3.jpg",
      "http://camp-buk.ba/images/naslovna.jpg",
      "http://camp-buk.ba/images/kamper.jpg",
      "http://camp-buk.ba/images/raft.png",
    ],
  },
  // { id: "0b7ebd1d-8ad6-48e6-946a-44bf3aefa367", name: "", description: "", images: [] },
  // { id: "132f6372-ff13-4c24-8612-90514526104b", name: "", description: "", images: [] },
  // { id: "17fe9ce3-0993-430a-b4d5-522b70947884", name: "", description: "", images: [] },
  {
    id: "183cee55-dd12-4d5b-ad0b-926d04fc9af5",
    name: "Le domaine du COQ en PAT",
    description:
      "Welcome to Auvergne! The COQ domain in PAT is an eco-friendly cottage for 13 to 15 people to train, meet, disconnect...",
    images: [
      "https://i0.wp.com/www.domaineducoqenpat.fr/wp-content/uploads/2023/12/20230121_172015-scaled.jpg?fit=2048%2C1536&ssl=1",
      "https://i0.wp.com/www.domaineducoqenpat.fr/wp-content/uploads/2024/02/0121_24-02-18-stage-tri-coqenpat-122-scaled.jpg?fit=2048%2C1365&ssl=1",
      "https://i0.wp.com/www.domaineducoqenpat.fr/wp-content/uploads/2023/06/domaine-coq-en-pat-BD-105-1-scaled.jpg?fit=2048%2C1365&ssl=1",
      "https://i0.wp.com/www.domaineducoqenpat.fr/wp-content/uploads/2023/06/WhatsApp-Image-2023-06-12-at-09.52.55.jpeg?fit=1024%2C576&ssl=1",
    ],
  },
  {
    id: "18a33721-22f8-4146-85c5-67c88563cae2",
    name: "Casa Fluxus",
    description:
      "A Nomad base land, just 1,5km from the beautiful village of Castelo de Vide, this is a nature retreat space were you can merge with the ecosystem. With your camper or tent, be our neighbour for a while, rest or get in collaboration if you feel to care the land with us or propose a skills sharing with the local community. We are a non smokers space.",
    images: [
      "https://www.campanyon.com/_next/image?url=https%3A%2F%2Fcdn.campanyon.com%2Fassets%2Fuser%2Ffull%2Fcampervancarcaravanhammockmotorhometentcastelo20de20videgdbljgxt0z.webp&w=1920&q=75",
      "https://www.campanyon.com/_next/image?url=https%3A%2F%2Fcdn.campanyon.com%2Fassets%2Fuser%2Ffull%2Fcampervancarcaravanhammockmotorhometentcastelo20de20videg9hz3j9ey7.webp&w=1920&q=75",
      "https://www.campanyon.com/_next/image?url=https%3A%2F%2Fcdn.campanyon.com%2Fassets%2Fuser%2Ffull%2Fcampervancarcaravanhammockmotorhometentcastelo20de20videgdbljh0ot1.webp&w=1920&q=75",
      "https://www.campanyon.com/_next/image?url=https%3A%2F%2Fcdn.campanyon.com%2Fassets%2Fuser%2Ffull%2Fcampervancaravanhammockmotorhometentrooftoptenttreetentcastelo20de20videgffvkliyas.webp&w=1920&q=75",
      "https://www.campanyon.com/_next/image?url=https%3A%2F%2Fcdn.campanyon.com%2Fassets%2Fuser%2Ffull%2Fcampervancaravanhammockmotorhometentrooftoptenttreetentcastelo20de20videgffvk06y10.webp&w=1920&q=75",
    ],
  },
  {
    id: "18ec751a-0efc-44e4-b956-e7b5f0267b79",
    name: "Camping Planik",
    description: "Welcome, to the oasis of untouched nature and peace of century old pine trees",
    images: [
      "https://www.planik.hr/images/planik_razanac_camping_in_dalmatia_croatia_head_bg.jpg",
      "https://www.planik.hr/images/planik_razanac_camping_in_dalmatia_croatia_basic_info_bg.jpg",
      "https://www.planik.hr/images/xplanik_razanac_camping_in_dalmatia_croatia_welcome_img1.jpg.pagespeed.ic.bZtXtr-dLO.jpg",
      "https://www.planik.hr/images/planik_razanac_camping_in_dalmatia_croatia_downloads_img2.jpg",
    ],
  },
  // { id: "19219463-f09f-4a74-93df-13f528ae5add", name: "", description: "", images: [] },
  // { id: "1af41103-51ef-4753-b0da-c2e0cfe3d7b3", name: "", description: "", images: [] },
  // { id: "1c656cc5-1e34-4d60-a6ef-2aebeccbcb12", name: "", description: "", images: [] },
  { id: "1d8530f3-0f3e-4454-b066-5fb07e17acf6", name: "", description: "", images: [] },
  // { id: "1ea350ca-58ae-41d0-8dd1-b37589aac972", name: "", description: "", images: [] },
  // { id: "20ffe9dd-44ef-42b0-b52b-75d5b3c1e53f", name: "", description: "", images: [] },
  // { id: "2569bd28-9267-4fc0-838d-d1b235cd4925", name: "", description: "", images: [] },
  // { id: "27dacb1b-25db-4e25-a0cc-a53974e79b16", name: "", description: "", images: [] },
  // { id: "28149512-1d07-46f3-aa21-a5d1449c7f7c", name: "", description: "", images: [] },
  // { id: "2a713eae-bc67-448e-8314-e0b52a886ff4", name: "", description: "", images: [] },
  // { id: "32c9d50e-1e4c-496d-aa55-f2f3e4a9b5ae", name: "", description: "", images: [] },
  // { id: "32fff0bb-1d7c-41d5-a525-e0c0c358a11f", name: "", description: "", images: [] },
  // { id: "331458a1-6997-487e-86d9-9ed0bc8ea5e8", name: "", description: "", images: [] },
  // { id: "33e79f60-6dfd-4df5-a9a8-0bab92625fdd", name: "", description: "", images: [] },
  // { id: "36ba51bb-181f-4a8c-8068-4e1e8bd048f6", name: "", description: "", images: [] },
  // { id: "37bca45e-b6a8-469b-8857-a54bc8c9953e", name: "", description: "", images: [] },
  // { id: "3d02195e-222d-44bc-aa19-7177b763fe07", name: "", description: "", images: [] },
  // { id: "3fad82be-b8d1-43bf-9032-6cf0a21abfef", name: "", description: "", images: [] },
  // { id: "41faea27-2e8a-4fd1-baa8-d96b64a318ef", name: "", description: "", images: [] },
  // { id: "428a9b8d-5ac0-43df-b769-ec0e69961814", name: "", description: "", images: [] },
  // { id: "48db02e9-84c8-4200-8269-aad5bc3f359c", name: "", description: "", images: [] },
  // { id: "4bc07bc8-e540-4d06-99f3-c445873c641c", name: "", description: "", images: [] },
  // { id: "4e844a16-7c51-4b9e-92c4-a8694d1e2ba2", name: "", description: "", images: [] },
  // { id: "55816f8d-2aa3-4200-8875-939190198fa9", name: "", description: "", images: [] },
  // { id: "58259f53-aa3f-498d-a8f8-038c08adb55d", name: "", description: "", images: [] },
  // { id: "5a7a4e3a-acc7-4e81-aa81-c2a8e915b01c", name: "", description: "", images: [] },
  // { id: "5ad16e5f-779f-46d3-9254-7e3bc462c533", name: "", description: "", images: [] },
  // { id: "61fb7131-e7ce-4040-bd7a-482516432220", name: "", description: "", images: [] },
  // { id: "61ffc831-f8d1-47f8-9616-f85513314516", name: "", description: "", images: [] },
  // { id: "62bdd1cf-aea0-435b-9356-221813a2de2a", name: "", description: "", images: [] },
  // { id: "638ced84-f0e6-4ace-ba7b-1d64b89ada3c", name: "", description: "", images: [] },
  // { id: "65e608c5-7e07-43d7-bd14-df7b7d4764b9", name: "", description: "", images: [] },
  // { id: "6ba8635c-e72b-486b-9af9-a8ef9fed1ef2", name: "", description: "", images: [] },
  // { id: "6d809786-05c0-4ba2-9ba9-9187baeb9e1d", name: "", description: "", images: [] },
  // { id: "6f4a39bb-de56-44d5-8166-f0448f8696e5", name: "", description: "", images: [] },
  // { id: "75a97c15-859f-4469-9d32-615c18cd6b9b", name: "", description: "", images: [] },
  // { id: "798a3785-5445-4b84-a1b5-0b6598768753", name: "", description: "", images: [] },
  // { id: "79cb6dad-40b4-4aa6-a79c-62be973cf581", name: "", description: "", images: [] },
  // { id: "7a115cd8-c3dc-4725-8ae0-f2e7c8f3e8da", name: "", description: "", images: [] },
  // { id: "7c143e1b-e10d-4334-9dce-20ffb75fd603", name: "", description: "", images: [] },
  // { id: "7cb2000e-0b45-4fc9-9d80-9e106ebbe45e", name: "", description: "", images: [] },
  // { id: "7d18b5d4-f5c1-4d07-9930-269d7156f8bc", name: "", description: "", images: [] },
  // { id: "8144e6d3-9fd4-490d-a6b5-3d5a09827bec", name: "", description: "", images: [] },
  // { id: "84122e17-f7c0-4869-b0d3-1c10a3b6d4d6", name: "", description: "", images: [] },
  // { id: "898e5c13-57b7-425b-a655-33d97e3f5a5b", name: "", description: "", images: [] },
  // { id: "8a196005-6802-4def-8c28-bd6bbe645708", name: "", description: "", images: [] },
  // { id: "8a4a059b-a000-4174-ade9-b2e75ed2051f", name: "", description: "", images: [] },
  // { id: "8e3700de-724b-4880-86bf-a3d4fdde7c16", name: "", description: "", images: [] },
  // { id: "9593f6f9-9946-4dfe-90d8-25a56f2a75f2", name: "", description: "", images: [] },
  // { id: "95d421e8-eb68-4a3d-a2d2-d45e908f1d94", name: "", description: "", images: [] },
  // { id: "9773cc00-bc69-444b-9a1a-606bbf1549af", name: "", description: "", images: [] },
  // { id: "9a77d6db-a3cf-4cf2-9507-e051dea12986", name: "", description: "", images: [] },
  // { id: "9d7ea771-d900-46cd-8b64-8e168bb3fd8b", name: "", description: "", images: [] },
  // { id: "a9888fb5-b14d-43a8-90c7-228972e63f60", name: "", description: "", images: [] },
  // { id: "abc57169-9043-4a38-8a1c-623ea1366d99", name: "", description: "", images: [] },
  // { id: "af75c7b8-e153-485a-86f2-398597c815a8", name: "", description: "", images: [] },
  // { id: "b2a37538-2606-4b1d-9d2e-34a0aadd21d9", name: "", description: "", images: [] },
  // { id: "b68caa27-6892-4e9c-b5cf-e449cf6fcbe9", name: "", description: "", images: [] },
  // { id: "b704c041-b036-4450-9357-b37e625ea3c5", name: "", description: "", images: [] },
  // { id: "bb291bfc-01ee-46c4-9a4b-979bb557e379", name: "", description: "", images: [] },
  // { id: "c4691f75-45e5-447f-b85e-1b4ccf9cf964", name: "", description: "", images: [] },
  // { id: "c484e30d-43e5-4ebf-8d63-d8f3fbed5fbb", name: "", description: "", images: [] },
  // { id: "c4d3782e-0b22-4e96-a2ec-3d639cadc4d7", name: "", description: "", images: [] },
  // { id: "c4d71bfa-21c6-4ac6-82a2-da9d113a36e1", name: "", description: "", images: [] },
  // { id: "c80f8eea-0855-4521-9756-09a0670d236c", name: "", description: "", images: [] },
  // { id: "cb33e275-2f29-4534-8515-0545058399bd", name: "", description: "", images: [] },
  // { id: "cb919c70-da42-4725-8ecf-a1cfe628342f", name: "", description: "", images: [] },
  // { id: "cbbaa07e-b2c0-4d9a-8b74-742e104caa9e", name: "", description: "", images: [] },
  // { id: "ccbea75f-6a88-4a4f-b200-b4453ca42e8f", name: "", description: "", images: [] },
  // { id: "d2ef43b7-4bf2-4a84-9cb5-45edd62d4471", name: "", description: "", images: [] },
  // { id: "da977f52-4382-4091-9282-eb0eabe2a32a", name: "", description: "", images: [] },
  // { id: "dc566f4e-8ee1-4c3c-be34-5f9084d2e93c", name: "", description: "", images: [] },
  // { id: "dd8c5261-ce02-4714-9c59-0f5b5140a92f", name: "", description: "", images: [] },
  // { id: "dd8d508c-e5ab-4513-b019-eea931e9fab7", name: "", description: "", images: [] },
  // { id: "deb2195a-ad15-4e75-addc-42e4bad5430d", name: "", description: "", images: [] },
  // { id: "e6898560-004b-424f-9675-e1e0d4473b78", name: "", description: "", images: [] },
  // { id: "e720c1e3-1ecc-43fe-bc49-3755acff8569", name: "", description: "", images: [] },
  // { id: "e766bd6b-95f5-4501-a236-e56ea2587594", name: "", description: "", images: [] },
  // { id: "e9643741-24dc-4cdb-b98b-7c2b291f8a15", name: "", description: "", images: [] },
  // { id: "ea16df70-887e-4821-a293-1a24b551f586", name: "", description: "", images: [] },
  // { id: "ea4e2ea8-f8ca-4876-bcf8-23fece30a4f4", name: "", description: "", images: [] },
  // { id: "ea8f50e4-30ce-4feb-8562-306c00833d32", name: "", description: "", images: [] },
  // { id: "eca4dbed-df56-4e94-a642-49212fa7d95c", name: "", description: "", images: [] },
  // { id: "ef6a3fc6-fcdc-484f-8422-f6f8213334b1", name: "", description: "", images: [] },
  // { id: "f517583a-3691-4c62-b9db-e24d5a099c77", name: "", description: "", images: [] },
  // { id: "f6640556-f310-4372-9428-3335720ee355", name: "", description: "", images: [] },
  // { id: "fbc41232-f1d1-4988-bf49-9c03ca42c103", name: "", description: "", images: [] },
  // { id: "fe107047-7778-4382-9d02-6a9da298c42c", name: "", description: "", images: [] },
]

async function main() {
  const creatorId = "f48e35d0-6292-456e-80f1-d679a49e449d" // dan@noquarter.co
  const errors = []
  for (const data of SPOT_DATA) {
    const spot = await prisma.spot.findUnique({ where: { id: data.id }, include: { images: true } })
    if (!spot) {
      errors.push("Spot not found:", data.id)
      continue
    }

    // DISONNECT COVER
    await prisma.spot.update({
      where: { id: data.id },
      data: {
        cover: spot.coverId ? { disconnect: { id: spot.coverId } } : undefined,
      },
    })

    // DELETE SPOT IMAGES
    await prisma.spotImage.deleteMany({ where: { spotId: spot.id } })

    // DISCONNECT ORIGINAL P4N IMAGES
    await prisma.spot.update({
      where: { id: data.id },
      data: {
        images: { set: [] },
      },
    })

    // CREATE NEW IMAGES FROM DATA
    for (const image of data.images) {
      const blurHash = await generateBlurHash(image)
      await prisma.spotImage.create({
        data: { spotId: data.id, path: image, blurHash, creatorId },
      })
    }

    // UPDATE SPOT
    const cover = await prisma.spotImage.findFirstOrThrow({ where: { path: data.images[0] } })
    await prisma.spot.update({ where: { id: data.id }, data: { coverId: cover.id, park4nightId: null, sourceUrl: null } })
  }
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(() => {
    console.log("done")
    process.exit(0)
  })
