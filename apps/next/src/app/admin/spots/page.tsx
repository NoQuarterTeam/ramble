import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { db } from "@/lib/server/db"
import dayjs from "dayjs"

const getSpots = async () => {
  return db.spot.findMany({
    // orderBy,
    // skip,
    // take,
    // where,
    take: 50,
    select: {
      id: true,
      name: true,
      description: true,
      sourceUrl: true,
      createdAt: true,
      verifiedAt: true,
      latitude: true,
      longitude: true,
      type: true,
      creator: true,
      verifier: true,
      images: true,
    },
  })
}

export const dynamic = "force-dynamic"

export default async function Page() {
  const spots = await getSpots()
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Spots</h1>
      <div className="flex items-end gap-2">
        {/* <form>
				<ExistingSearchParams exclude={["type"]} />
				<p className="font-medium text-sm">Type</p>
				<Select
					defaultValue={searchParams.get("type") || ""}
					onChange={(e) => e.currentTarget.form?.dispatchEvent(new Event("submit", { bubbles: true }))}
					name="type"
				>
					<option value="">All</option>
					{SPOT_TYPE_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</Select>
			</form> */}
        {/* 
			<Form>
				<ExistingSearchParams exclude={["unverified"]} />
				<Button
					variant={searchParams.get("unverified") === "true" ? "primary" : "outline"}
					type="submit"
					name={searchParams.get("unverified") === "true" ? undefined : "unverified"}
					value={searchParams.get("unverified") === "true" ? undefined : "true"}
				>
					Show {unverifiedSpotsCount} unverified
				</Button>
			</Form> */}

        {/* <div>
				<Search />
			</div> */}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Desc</TableHead>

            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spots.map((spot) => (
            <TableRow key={spot.id}>
              <TableCell className="font-medium line-clamp-1">{spot.name}</TableCell>
              <TableCell className="line-clamp-1">{spot.description}</TableCell>
              <TableCell className="text-right">{dayjs(spot.createdAt).format()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
      </Table>
    </div>
  )
}
