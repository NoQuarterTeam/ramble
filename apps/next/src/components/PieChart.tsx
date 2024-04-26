import * as d3 from "d3-shape"

interface Props {
  size: number
  series: number[]
  sliceColor: string[]
}

export function PieChart({ size, series, sliceColor }: Props) {
  const radius = size / 2
  const pieGenerator = d3.pie().sort(null)
  const arcs = pieGenerator(series)
  return (
    <svg width={size} height={size}>
      <title>pie char</title>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        {arcs.map((arc, i) => {
          const arcGenerator = d3.arc().outerRadius(radius).startAngle(arc.startAngle).endAngle(arc.endAngle).innerRadius(0)
          return (
            <path
              key={arc.index}
              fill={sliceColor[i]}
              // @ts-ignore
              d={arcGenerator()}
            />
          )
        })}
      </g>
    </svg>
  )
}
