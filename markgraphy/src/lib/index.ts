// Markgraphy — ASCII-framed Svelte graphs for markdown.
// Glyphs draw the chart: a dashed frame, `+` corners, `[ TITLE ]` on the top
// edge, one accent color. No SVG, no canvas, no dependencies.

// Frame primitives
export { default as Graph } from './frame/Graph.svelte';
export type { GraphProps, GraphDash, GraphMotion, GraphPad } from './frame/Graph.svelte';
export { default as GraphBody } from './frame/GraphBody.svelte';
export { default as GraphRule } from './frame/GraphRule.svelte';
export { default as GraphTrack } from './frame/GraphTrack.svelte';
export { default as GraphTick } from './frame/GraphTick.svelte';
export { default as GraphArrow } from './frame/GraphArrow.svelte';

// Glyphs, tones, motion, clock
export * from './frame/glyphs';
export * from './frame/tone';
export * from './frame/motion';
export * from './frame/clock';

// Graphs
export { default as GraphActivity } from './graphs/GraphActivity.svelte';
export type { ActivityDay, GraphActivityProps } from './graphs/GraphActivity.svelte';
export { default as GraphBars } from './graphs/GraphBars.svelte';
export type { BarSeries, GraphBarsProps } from './graphs/GraphBars.svelte';
export { default as GraphBullet } from './graphs/GraphBullet.svelte';
export type { BulletItem, GraphBulletProps } from './graphs/GraphBullet.svelte';
export { default as GraphCalendar } from './graphs/GraphCalendar.svelte';
export type { CalendarMark, GraphCalendarProps } from './graphs/GraphCalendar.svelte';
export { default as GraphCells } from './graphs/GraphCells.svelte';
export type { CellGrid, GraphCellsProps } from './graphs/GraphCells.svelte';
export { default as GraphCompare } from './graphs/GraphCompare.svelte';
export type { CompareCell, CompareRow, GraphCompareProps } from './graphs/GraphCompare.svelte';
export { default as GraphCountdown } from './graphs/GraphCountdown.svelte';
export type { GraphCountdownProps } from './graphs/GraphCountdown.svelte';
export { default as GraphDiff } from './graphs/GraphDiff.svelte';
export type { DiffSign, DiffRow, GraphDiffProps } from './graphs/GraphDiff.svelte';
export { default as GraphFlow } from './graphs/GraphFlow.svelte';
export type { FlowTone, FlowNode, FlowRow, GraphFlowProps } from './graphs/GraphFlow.svelte';
export { default as GraphFunnel } from './graphs/GraphFunnel.svelte';
export type { FunnelStep, GraphFunnelProps } from './graphs/GraphFunnel.svelte';
export { default as GraphGantt } from './graphs/GraphGantt.svelte';
export type { GanttItem, GraphGanttProps } from './graphs/GraphGantt.svelte';
export { default as GraphHeatmap } from './graphs/GraphHeatmap.svelte';
export type { HeatRow, GraphHeatmapProps } from './graphs/GraphHeatmap.svelte';
export { default as GraphInvoice } from './graphs/GraphInvoice.svelte';
export type { InvoiceParty, InvoiceMeta, InvoiceItem, InvoiceTotal, GraphInvoiceProps } from './graphs/GraphInvoice.svelte';
export { default as GraphKpi } from './graphs/GraphKpi.svelte';
export type { GraphKpiProps } from './graphs/GraphKpi.svelte';
export { default as GraphLatency } from './graphs/GraphLatency.svelte';
export type { LatencyPoint, GraphLatencyProps } from './graphs/GraphLatency.svelte';
export { default as GraphMeter } from './graphs/GraphMeter.svelte';
export type { GraphMeterProps } from './graphs/GraphMeter.svelte';
export { default as GraphPlot } from './graphs/GraphPlot.svelte';
export type { GraphPlotProps } from './graphs/GraphPlot.svelte';
export { default as GraphQuota } from './graphs/GraphQuota.svelte';
export type { GraphQuotaProps } from './graphs/GraphQuota.svelte';
export { default as GraphRank } from './graphs/GraphRank.svelte';
export type { RankItem, GraphRankProps } from './graphs/GraphRank.svelte';
export { default as GraphSlope } from './graphs/GraphSlope.svelte';
export type { SlopeItem, GraphSlopeProps } from './graphs/GraphSlope.svelte';
export { default as GraphSlo } from './graphs/GraphSlo.svelte';
export type { GraphSloProps } from './graphs/GraphSlo.svelte';
export { default as GraphSpark } from './graphs/GraphSpark.svelte';
export type { GraphSparkProps } from './graphs/GraphSpark.svelte';
export { default as GraphSpec } from './graphs/GraphSpec.svelte';
export type { SpecRow, GraphSpecProps } from './graphs/GraphSpec.svelte';
export { default as GraphStack } from './graphs/GraphStack.svelte';
export type { StackSegment, StackRow, GraphStackProps } from './graphs/GraphStack.svelte';
export { default as GraphStat } from './graphs/GraphStat.svelte';
export type { StatItem, GraphStatProps } from './graphs/GraphStat.svelte';
export { default as GraphTable } from './graphs/GraphTable.svelte';
export type { Cell, GraphTableProps } from './graphs/GraphTable.svelte';
export { default as GraphTimeline } from './graphs/GraphTimeline.svelte';
export type { GraphTimelineProps } from './graphs/GraphTimeline.svelte';
export { default as GraphTimer } from './graphs/GraphTimer.svelte';
export type { TimerKind, GraphTimerProps } from './graphs/GraphTimer.svelte';
export { default as GraphTree } from './graphs/GraphTree.svelte';
export type { TreeNode, GraphTreeProps } from './graphs/GraphTree.svelte';
export { default as GraphUptime } from './graphs/GraphUptime.svelte';
export type { UptimeStatus, GraphUptimeProps } from './graphs/GraphUptime.svelte';
export { default as GraphWaffle } from './graphs/GraphWaffle.svelte';
export type { GraphWaffleProps } from './graphs/GraphWaffle.svelte';
export { default as GraphWaterfall } from './graphs/GraphWaterfall.svelte';
export type { WaterfallKind, WaterfallItem, GraphWaterfallProps } from './graphs/GraphWaterfall.svelte';

// Diagrams — raw ASCII/Unicode figures with live tokens, plus players and an editor
export { default as AmplifierDiagram } from './diagram/AmplifierDiagram.svelte';
export type { AmplifierDiagramProps } from './diagram/AmplifierDiagram.svelte';
export { default as AsciiDiagram } from './diagram/AsciiDiagram.svelte';
export type { AsciiDiagramProps } from './diagram/AsciiDiagram.svelte';
export { default as DiagramEditor } from './diagram/DiagramEditor.svelte';
export { default as MetricsTableDiagram } from './diagram/MetricsTableDiagram.svelte';
export type { MetricRow, MetricsTableDiagramProps } from './diagram/MetricsTableDiagram.svelte';
export { default as NestedRadiiDiagram } from './diagram/NestedRadiiDiagram.svelte';
export type { NestedRadiiDiagramProps } from './diagram/NestedRadiiDiagram.svelte';
export { default as PromptLoopDiagram } from './diagram/PromptLoopDiagram.svelte';
export type { PromptLoopDiagramProps } from './diagram/PromptLoopDiagram.svelte';
export {
	alignBoxLines,
	escapeHtml,
	formatDiagramHtml
} from './diagram/parser';
export type { DiagramToken, HighlightRule } from './diagram/parser';
export { dashEdge, overlayRow, padEnd, padRow, padStart, splitLabeledEdge } from './diagram/ascii';
export type { ArtCell, ArtSeg } from './diagram/ascii';

// Animated — live glyph components: typewriters, scopes, sims, and strips
export { default as GraphAgni } from './animated/GraphAgni.svelte';
export type { GraphAgniProps } from './animated/GraphAgni.svelte';
export { default as GraphAum } from './animated/GraphAum.svelte';
export type { GraphAumProps } from './animated/GraphAum.svelte';
export { default as GraphBoot } from './animated/GraphBoot.svelte';
export type { GraphBootStep, GraphBootProps } from './animated/GraphBoot.svelte';
export { default as GraphCron } from './animated/GraphCron.svelte';
export type { GraphCronProps } from './animated/GraphCron.svelte';
export { default as GraphDamru } from './animated/GraphDamru.svelte';
export type { GraphDamruProps } from './animated/GraphDamru.svelte';
export { default as GraphDeps } from './animated/GraphDeps.svelte';
export type { DepNode, GraphDepsProps } from './animated/GraphDeps.svelte';
export { default as GraphDiya } from './animated/GraphDiya.svelte';
export type { GraphDiyaProps } from './animated/GraphDiya.svelte';
export { default as GraphFire } from './animated/GraphFire.svelte';
export type { GraphFireProps } from './animated/GraphFire.svelte';
export { default as GraphFlame } from './animated/GraphFlame.svelte';
export type { GraphFlameProps } from './animated/GraphFlame.svelte';
export { default as GraphFlowPlayer } from './animated/GraphFlowPlayer.svelte';
export type { FlowStep, GraphFlowPlayerProps } from './animated/GraphFlowPlayer.svelte';
export { default as GraphGanga } from './animated/GraphGanga.svelte';
export type { GraphGangaProps } from './animated/GraphGanga.svelte';
export { default as GraphHash } from './animated/GraphHash.svelte';
export type { GraphHashProps } from './animated/GraphHash.svelte';
export { default as GraphJapa } from './animated/GraphJapa.svelte';
export type { GraphJapaProps } from './animated/GraphJapa.svelte';
export { default as GraphLife } from './animated/GraphLife.svelte';
export type { GraphLifeProps } from './animated/GraphLife.svelte';
export { default as GraphMandel } from './animated/GraphMandel.svelte';
export type { GraphMandelProps } from './animated/GraphMandel.svelte';
export { default as GraphMandala } from './animated/GraphMandala.svelte';
export type { GraphMandalaProps } from './animated/GraphMandala.svelte';
export { default as GraphPulse } from './animated/GraphPulse.svelte';
export type { PulseStatus, GraphPulseProps } from './animated/GraphPulse.svelte';
export { default as GraphRain } from './animated/GraphRain.svelte';
export type { GraphRainProps } from './animated/GraphRain.svelte';
export { default as GraphScatter } from './animated/GraphScatter.svelte';
export type { ScatterPoint, GraphScatterProps } from './animated/GraphScatter.svelte';
export { default as GraphScope } from './animated/GraphScope.svelte';
export type { ScopeMode, GraphScopeProps } from './animated/GraphScope.svelte';
export { default as GraphSequence } from './animated/GraphSequence.svelte';
export type { GraphSequenceProps } from './animated/GraphSequence.svelte';
export { default as GraphSpinners } from './animated/GraphSpinners.svelte';
export type { SpinnerKind, GraphSpinnersProps } from './animated/GraphSpinners.svelte';
export { default as GraphState } from './animated/GraphState.svelte';
export type { GraphStateProps } from './animated/GraphState.svelte';
export { default as GraphStream } from './animated/GraphStream.svelte';
export type { StreamKind, GraphStreamProps } from './animated/GraphStream.svelte';
export { default as GraphSurya } from './animated/GraphSurya.svelte';
export type { GraphSuryaProps } from './animated/GraphSurya.svelte';
export { default as GraphTerminal } from './animated/GraphTerminal.svelte';
export type { TerminalLine, GraphTerminalProps } from './animated/GraphTerminal.svelte';
export { default as GraphTicker } from './animated/GraphTicker.svelte';
export type { TickerItem, GraphTickerProps } from './animated/GraphTicker.svelte';
export { default as GraphTypewriter } from './animated/GraphTypewriter.svelte';
export type { GraphTypewriterProps } from './animated/GraphTypewriter.svelte';
export { default as GraphWorkflow } from './animated/GraphWorkflow.svelte';
export type { WorkflowTone, WorkflowNode, WorkflowEdge, GraphWorkflowProps } from './animated/GraphWorkflow.svelte';
export { default as ShuffleText } from './animated/ShuffleText.svelte';
export type { ShuffleTextProps, ShuffleDirection, AnimationMode, TagName } from './animated/ShuffleText.svelte';
