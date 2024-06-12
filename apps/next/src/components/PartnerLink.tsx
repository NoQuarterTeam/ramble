import { type SpotPartnerFields, isPartnerSpot, partners } from "@ramble/shared"

interface Props {
  spot: SpotPartnerFields
}

export function PartnerLink(props: Props) {
  if (!isPartnerSpot(props.spot)) return null

  const partner = props.spot.campspaceId
    ? partners.campspace
    : props.spot.theCragId
      ? partners.theCrag
      : props.spot.volunteeringEventsId
        ? partners.volunteeringEvents
        : props.spot.komootId
          ? partners.komoot
          : props.spot.hipcampId
            ? partners.hipcamp
            : props.spot.natuurKampeerterreinenId
              ? partners.natuur
              : props.spot.park4nightId
                ? partners.park4night
                : props.spot.nesteId
                  ? partners.neste
                  : props.spot.surflineId
                    ? partners.surfline
                    : props.spot.roadsurferId
                      ? partners.roadsurfer
                      : props.spot.cucortuId
                        ? partners.cucortu
                        : props.spot.loodusegakoosId
                          ? partners.loodusegakoos
                          : props.spot.norcampId
                            ? partners.norcamp
                            : props.spot.mossyEarthId
                              ? partners.mossyEarth
                              : props.spot.rewildingEuropeId
                                ? partners.rewildingEurope
                                : props.spot.polskiCaravaningId
                                  ? partners.polskiCaravaning
                                  : partners.camperguru

  if (!props.spot.sourceUrl) return null
  return (
    <a
      href={props.spot.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex cursor-pointer flex-row items-center justify-between gap-6 rounded-xs border border-hover px-6 py-2"
    >
      <p className="text-lg">{partner.pretext}</p>
      <img alt="partner" className="h-[40px] w-[150px] bg-right object-contain" src={partner.logo.dark} />
    </a>
  )
}
