import { useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import { presetDomain } from "../utils";

export default function CombinedChart({ data, showEMA, onCrosshair, rangePreset, resetNonce }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const priceTagRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const zoomTransformRef = useRef(d3.zoomIdentity);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || dims.w === 0 || dims.h === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const parsedData = data.map((d) => ({ ...d, date: new Date(d.date) }));
    if (!parsedData.length) return;

    const W_total = dims.w;
    const H_total = dims.h;
    const ML = 14;
    const MR = 74;
    const MTOP = 18;
    const MBOT = 26;
    const W = Math.max(0, W_total - ML - MR);
    const PRICEH = Math.floor(H_total * 0.66);
    const priceInnerH = Math.max(0, PRICEH - MTOP - MBOT);
    const macdTop = PRICEH + 6;
    const macdInnerH = Math.max(0, H_total - macdTop - MBOT);

    svg.attr("width", W_total).attr("height", H_total);

    const baseX = d3.scaleTime()
      .domain(d3.extent(parsedData, (d) => d.date))
      .range([ML, ML + W]);

    const overlay = svg.append("rect")
      .attr("x", ML).attr("y", 0)
      .attr("width", W).attr("height", H_total)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    const mainG = svg.append("g");
    const crossG = svg.append("g").style("display", "none").attr("pointer-events", "none");
    const xLabel = crossG.append("g");
    const yPriceLabel = crossG.append("g");
    const yMacdLabel = crossG.append("g");

    crossG.append("line").attr("class", "cx")
      .attr("y1", MTOP).attr("y2", macdTop + macdInnerH)
      .attr("stroke", "rgba(77,158,247,0.55)").attr("stroke-width", 1).attr("stroke-dasharray", "4,4");
    crossG.append("line").attr("class", "cy-price")
      .attr("x1", ML).attr("x2", ML + W)
      .attr("stroke", "rgba(77,158,247,0.35)").attr("stroke-width", 1).attr("stroke-dasharray", "4,4");
    crossG.append("line").attr("class", "cy-macd")
      .attr("x1", ML).attr("x2", ML + W)
      .attr("stroke", "rgba(77,158,247,0.25)").attr("stroke-width", 1).attr("stroke-dasharray", "4,4");

    let currentXScale = baseX;
    let currentYPrice = null;
    let currentYMacd = null;
    let currentVisible = parsedData;

    const drawAxisLabel = (group, x, y, text, fill) => {
      group.selectAll("*").remove();
      group.append("rect")
        .attr("x", x).attr("y", y)
        .attr("width", Math.max(44, text.length * 7.1)).attr("height", 18)
        .attr("rx", 7).attr("fill", fill).attr("opacity", 0.94);
      group.append("text")
        .attr("x", x + 8).attr("y", y + 12)
        .attr("fill", "#04111b").style("font-size", "9px").style("font-weight", 700)
        .text(text);
    };

    const draw = (transform = zoomTransformRef.current) => {
      mainG.selectAll("*").remove();
      currentXScale = transform.rescaleX(baseX);
      const [domainStart, domainEnd] = currentXScale.domain();
      currentVisible = parsedData.filter((d) => d.date >= domainStart && d.date <= domainEnd);
      if (currentVisible.length < 2) currentVisible = parsedData;

      const priceMin = d3.min(currentVisible, (d) => d.low) * 0.996;
      const priceMax = d3.max(currentVisible, (d) => d.high) * 1.004;
      currentYPrice = d3.scaleLinear().domain([priceMin, priceMax]).range([MTOP + priceInnerH, MTOP]);

      const macdVals = currentVisible.flatMap((d) => [d.MACD, d.MACD_signal_line, 0].filter((v) => v != null));
      const histVals = currentVisible.map((d) => d.MACD_hist).filter((v) => v != null);
      const [mMinRaw, mMaxRaw] = d3.extent([...macdVals, ...histVals]);
      const mMin = mMinRaw ?? -1;
      const mMax = mMaxRaw ?? 1;
      const mPad = Math.abs(mMax - mMin) * 0.16 || 0.08;
      currentYMacd = d3.scaleLinear().domain([mMin - mPad, mMax + mPad]).range([macdTop + macdInnerH, macdTop + 4]);

      const priceGrid = mainG.append("g");
      currentYPrice.ticks(7).forEach((t) => {
        priceGrid.append("line").attr("x1", ML).attr("x2", ML + W)
          .attr("y1", currentYPrice(t)).attr("y2", currentYPrice(t))
          .attr("stroke", "rgba(56, 82, 108, 0.46)").attr("stroke-width", 1);
      });
      currentXScale.ticks(8).forEach((t) => {
        const x = currentXScale(t);
        priceGrid.append("line").attr("x1", x).attr("x2", x)
          .attr("y1", MTOP).attr("y2", MTOP + priceInnerH)
          .attr("stroke", "rgba(41, 64, 88, 0.42)").attr("stroke-width", 1);
      });

      const macdGrid = mainG.append("g");
      currentYMacd.ticks(4).forEach((t) => {
        macdGrid.append("line").attr("x1", ML).attr("x2", ML + W)
          .attr("y1", currentYMacd(t)).attr("y2", currentYMacd(t))
          .attr("stroke", "rgba(56, 82, 108, 0.42)").attr("stroke-width", 1);
      });
      currentXScale.ticks(8).forEach((t) => {
        const x = currentXScale(t);
        macdGrid.append("line").attr("x1", x).attr("x2", x)
          .attr("y1", macdTop + 4).attr("y2", macdTop + macdInnerH)
          .attr("stroke", "rgba(41, 64, 88, 0.42)").attr("stroke-width", 1);
      });

      mainG.append("line").attr("x1", ML).attr("x2", ML + W)
        .attr("y1", currentYMacd(0)).attr("y2", currentYMacd(0))
        .attr("stroke", "rgba(129, 159, 193, 0.6)").attr("stroke-width", 1.2).attr("stroke-dasharray", "5,4");

      const candleW = Math.max(2, Math.min(13, W / currentVisible.length - 1.5));
      const candleG = mainG.append("g");
      currentVisible.forEach((d) => {
        const x = currentXScale(d.date);
        const isUp = d.close >= d.open;
        const color = isUp ? "#27c281" : "#ea5a64";
        candleG.append("line").attr("x1", x).attr("x2", x)
          .attr("y1", currentYPrice(d.high)).attr("y2", currentYPrice(d.low))
          .attr("stroke", color).attr("stroke-width", 1);
        const bodyTop = currentYPrice(Math.max(d.open, d.close));
        const bodyHeight = Math.max(1.5, Math.abs(currentYPrice(d.open) - currentYPrice(d.close)));
        candleG.append("rect")
          .attr("x", x - candleW / 2).attr("y", bodyTop)
          .attr("width", candleW).attr("height", bodyHeight)
          .attr("rx", candleW > 8 ? 2 : 0)
          .attr("fill", isUp ? "rgba(39,194,129,0.88)" : "rgba(234,90,100,0.9)");
      });

      if (showEMA) {
        const emaLine = d3.line()
          .defined((d) => d[1] != null)
          .x((d) => currentXScale(d[0])).y((d) => currentYPrice(d[1]))
          .curve(d3.curveMonotoneX);
        mainG.append("path")
          .datum(currentVisible.map((d) => [d.date, d.EMA200]))
          .attr("fill", "none").attr("stroke", "#8d95ff")
          .attr("stroke-width", 1.8).attr("opacity", 0.95).attr("d", emaLine);
      }

      const signalG = mainG.append("g");
      currentVisible.forEach((d) => {
        if (d.pre_signal === 1) {
          signalG.append("line").attr("x1", currentXScale(d.date)).attr("x2", currentXScale(d.date))
            .attr("y1", MTOP).attr("y2", MTOP + priceInnerH)
            .attr("stroke", "rgba(39,194,129,0.16)").attr("stroke-width", 1.4).attr("stroke-dasharray", "4,4");
          signalG.append("polygon")
            .attr("points", () => {
              const cx = currentXScale(d.date);
              const cy = currentYPrice(d.low) + 10;
              return `${cx},${cy - 8} ${cx - 5},${cy} ${cx + 5},${cy}`;
            })
            .attr("fill", "#27c281").attr("opacity", 0.9);
        }
        if (d.pre_signal === -1) {
          signalG.append("line").attr("x1", currentXScale(d.date)).attr("x2", currentXScale(d.date))
            .attr("y1", MTOP).attr("y2", MTOP + priceInnerH)
            .attr("stroke", "rgba(234,90,100,0.16)").attr("stroke-width", 1.4).attr("stroke-dasharray", "4,4");
          signalG.append("polygon")
            .attr("points", () => {
              const cx = currentXScale(d.date);
              const cy = currentYPrice(d.high) - 10;
              return `${cx},${cy + 8} ${cx - 5},${cy} ${cx + 5},${cy}`;
            })
            .attr("fill", "#ea5a64").attr("opacity", 0.92);
        }
      });

      const barW = Math.max(2, Math.min(11, W / currentVisible.length - 1));
      const histG = mainG.append("g");
      currentVisible.forEach((d) => {
        if (d.MACD_hist == null) return;
        const pos = d.MACD_hist >= 0;
        histG.append("rect")
          .attr("x", currentXScale(d.date) - barW / 2)
          .attr("y", currentYMacd(Math.max(0, d.MACD_hist)))
          .attr("width", barW)
          .attr("height", Math.max(1, Math.abs(currentYMacd(d.MACD_hist) - currentYMacd(0))))
          .attr("fill", pos ? "rgba(39,194,129,0.72)" : "rgba(234,90,100,0.74)");
      });

      const macdLineGen = d3.line()
        .defined((d) => d[1] != null)
        .x((d) => currentXScale(d[0])).y((d) => currentYMacd(d[1]))
        .curve(d3.curveMonotoneX);
      mainG.append("path")
        .datum(currentVisible.map((d) => [d.date, d.MACD]))
        .attr("fill", "none").attr("stroke", "#8ba4e8").attr("stroke-width", 1.7).attr("d", macdLineGen);
      mainG.append("path")
        .datum(currentVisible.map((d) => [d.date, d.MACD_signal_line]))
        .attr("fill", "none").attr("stroke", "#e8924a").attr("stroke-width", 1.5).attr("d", macdLineGen);

      const pYAxis = d3.axisRight(currentYPrice).ticks(7)
        .tickFormat((v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(2)));
      const pYG = mainG.append("g").attr("transform", `translate(${ML + W},0)`).call(pYAxis);
      pYG.selectAll("text").style("fill", "#6280a0").style("font-size", "9px");
      pYG.select(".domain").remove();
      pYG.selectAll(".tick line").remove();

      const mYAxis = d3.axisRight(currentYMacd).ticks(4).tickFormat((v) => v.toFixed(2));
      const mYG = mainG.append("g").attr("transform", `translate(${ML + W},0)`).call(mYAxis);
      mYG.selectAll("text").style("fill", "#6280a0").style("font-size", "9px");
      mYG.select(".domain").remove();
      mYG.selectAll(".tick line").remove();

      const timeFmt = currentVisible.length > 220 ? d3.timeFormat("%b '%y") : d3.timeFormat("%b %d");
      const xPriceAxis = mainG.append("g").attr("transform", `translate(0,${MTOP + priceInnerH})`);
      xPriceAxis.call(d3.axisBottom(currentXScale).ticks(6).tickFormat(timeFmt));
      xPriceAxis.selectAll("text").style("fill", "#6280a0").style("font-size", "9px");
      xPriceAxis.select(".domain").style("stroke", "rgba(74,102,130,0.7)");
      xPriceAxis.selectAll(".tick line").style("stroke", "rgba(74,102,130,0.45)");

      const xMacdAxis = mainG.append("g").attr("transform", `translate(0,${macdTop + macdInnerH})`);
      xMacdAxis.call(d3.axisBottom(currentXScale).ticks(6).tickFormat(timeFmt));
      xMacdAxis.selectAll("text").style("fill", "#6280a0").style("font-size", "9px");
      xMacdAxis.select(".domain").style("stroke", "rgba(74,102,130,0.7)");
      xMacdAxis.selectAll(".tick line").style("stroke", "rgba(74,102,130,0.45)");

      mainG.append("line").attr("x1", ML).attr("x2", ML + W)
        .attr("y1", PRICEH).attr("y2", PRICEH)
        .attr("stroke", "rgba(89, 120, 153, 0.18)").attr("stroke-width", 1);

      const lastVisible = currentVisible[currentVisible.length - 1]?.close;
      if (lastVisible != null && priceTagRef.current) {
        priceTagRef.current.style.top = `${currentYPrice(lastVisible)}px`;
        priceTagRef.current.style.display = "flex";
        priceTagRef.current.textContent = lastVisible >= 1000 ? lastVisible.toFixed(0) : lastVisible.toFixed(2);
      }
    };

    const zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[ML, 0], [ML + W, H_total]])
      .extent([[ML, 0], [ML + W, H_total]])
      .on("zoom", (event) => {
        zoomTransformRef.current = event.transform;
        draw(event.transform);
      });

    zoomBehaviorRef.current = zoom;
    overlay.call(zoom);

    overlay.on("mousemove", function (event) {
      const [mx] = d3.pointer(event);
      if (mx < ML || mx > ML + W) return;
      crossG.style("display", null);

      const date = currentXScale.invert(mx);
      const bi = d3.bisector((d) => d.date).center;
      const idx = Math.min(Math.max(bi(currentVisible, date), 0), currentVisible.length - 1);
      const point = currentVisible[idx];
      if (!point) return;

      const px = currentXScale(point.date);
      const py = currentYPrice(point.close);
      const myMacd = point.MACD ?? 0;
      const pyMacd = currentYMacd(myMacd);

      crossG.select(".cx").attr("x1", px).attr("x2", px);
      crossG.select(".cy-price").attr("y1", py).attr("y2", py);
      crossG.select(".cy-macd").attr("y1", pyMacd).attr("y2", pyMacd);

      drawAxisLabel(xLabel, Math.max(ML, Math.min(px - 26, ML + W - 64)), H_total - 20, d3.timeFormat("%d %b %Y")(point.date), "#7bbdff");
      drawAxisLabel(yPriceLabel, ML + W + 8, py - 9, point.close?.toFixed(2) ?? "--", "#7bbdff");
      drawAxisLabel(yMacdLabel, ML + W + 8, pyMacd - 9, myMacd.toFixed(2), "#f5b34d");

      if (onCrosshair) onCrosshair(point);
    });

    overlay.on("mouseleave", function () {
      crossG.style("display", "none");
      if (onCrosshair) onCrosshair(null);
    });

    overlay.on("dblclick.zoom", null);
    overlay.on("dblclick", () => {
      zoomTransformRef.current = d3.zoomIdentity;
      svg.select("rect").call(zoom.transform, d3.zoomIdentity);
    });

    const preset = presetDomain(parsedData, rangePreset);
    if (preset) {
      const [start, end] = preset;
      const x0 = baseX(start);
      const x1 = baseX(end);
      const k = Math.max(1, Math.min(40, W / Math.max(8, x1 - x0)));
      const tx = ML - x0 * k;
      const nextTransform = d3.zoomIdentity.translate(tx, 0).scale(k);
      zoomTransformRef.current = nextTransform;
      overlay.call(zoom.transform, nextTransform);
    } else if (rangePreset === "ALL") {
      zoomTransformRef.current = d3.zoomIdentity;
      overlay.call(zoom.transform, d3.zoomIdentity);
    } else {
      draw(zoomTransformRef.current);
    }
  }, [data, showEMA, dims, onCrosshair, rangePreset, resetNonce]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      <div ref={priceTagRef} className="price-tag-el" style={{ display: "none" }} />
    </div>
  );
}
