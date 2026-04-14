import { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function EquityMini({ equityCurve }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !equityCurve?.length) return;
    const el = ref.current;
    const W = el.parentElement?.clientWidth || 200;
    const H = 52;
    const svg = d3.select(el);
    svg.selectAll("*").remove();
    svg.attr("width", W).attr("height", H);

    const parsed = equityCurve.map((e) => ({ ...e, date: new Date(e.date) }));
    const x = d3.scaleTime().domain(d3.extent(parsed, (d) => d.date)).range([0, W]);
    const y = d3.scaleLinear().domain(d3.extent(parsed, (d) => d.equity)).nice().range([H - 3, 3]);
    const isPos = parsed[parsed.length - 1].equity >= parsed[0].equity;
    const c = isPos ? "#27c281" : "#ea5a64";

    svg.append("path")
      .datum(parsed)
      .attr("fill", isPos ? "rgba(39,194,129,0.08)" : "rgba(234,90,100,0.08)")
      .attr("d", d3.area().x((d) => x(d.date)).y0(H).y1((d) => y(d.equity)).curve(d3.curveMonotoneX));

    svg.append("path")
      .datum(parsed)
      .attr("fill", "none").attr("stroke", c).attr("stroke-width", 1.6)
      .attr("d", d3.line().x((d) => x(d.date)).y((d) => y(d.equity)).curve(d3.curveMonotoneX));
  }, [equityCurve]);

  return <svg ref={ref} className="eq-svg" />;
}
