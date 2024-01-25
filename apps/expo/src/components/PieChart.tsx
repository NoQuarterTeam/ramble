import { G, Path, Svg } from "react-native-svg"
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
    <Svg width={size} height={size}>
      <G transform={`translate(${size / 2}, ${size / 2})`}>
        {arcs.map((arc, i) => {
          const arcGenerator = d3.arc().outerRadius(radius).startAngle(arc.startAngle).endAngle(arc.endAngle).innerRadius(0)
          return (
            <Path
              key={arc.index}
              fill={sliceColor[i]}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              d={arcGenerator()}
            />
          )
        })}
      </G>
    </Svg>
  )
}
