import clsx from "clsx";
import { Text, View } from "react-native";

const CHART_HEIGHT = 170;
const MIN_BAR_HEIGHT = 4;

const formatTooltip = (value: number, currency = "USD"): string => {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(value);
    } catch {
        return `$${Math.round(value)}`;
    }
};

const computeNiceMax = (maxValue: number): number => {
    if (maxValue <= 0) return 4;
    const roughStep = maxValue / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const niceStep = Math.ceil(roughStep / magnitude) * magnitude;
    return niceStep * 4;
};

const InsightsBarChart = ({ weekly, peakIndex, peakAmount, currency }: InsightsBarChartProps) => {
    const maxValue = Math.max(...weekly.map((bar) => bar.amount), 0);
    const niceMax = computeNiceMax(maxValue);

    // Y-axis ticks from top (niceMax) to bottom (0).
    const ticks = [1, 0.75, 0.5, 0.25, 0].map((fraction) => Math.round(niceMax * fraction));

    const barHeightFor = (amount: number): number => {
        if (amount <= 0) return 0;
        return Math.max((amount / niceMax) * CHART_HEIGHT, MIN_BAR_HEIGHT);
    };

    return (
        <View className="insights-chart-card">
            <View className="insights-chart-plot">
                <View className="insights-yaxis" style={{ height: CHART_HEIGHT }}>
                    {ticks.map((tick, index) => (
                        <Text key={`tick-${index}`} className="insights-yaxis-label">
                            {tick}
                        </Text>
                    ))}
                </View>

                <View className="insights-grid">
                    <View className="relative" style={{ height: CHART_HEIGHT }}>
                        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                            <View
                                key={`grid-${fraction}`}
                                className="insights-gridline"
                                style={{ top: fraction * CHART_HEIGHT }}
                            />
                        ))}

                        <View className="insights-bars" style={{ height: CHART_HEIGHT }}>
                            {weekly.map((bar, index) => {
                                const isPeak = index === peakIndex && peakAmount > 0;
                                return (
                                    <View key={bar.label} className="insights-bar-col">
                                        {isPeak && (
                                            <View className="insights-tooltip">
                                                <Text className="insights-tooltip-text">
                                                    {formatTooltip(peakAmount, currency)}
                                                </Text>
                                            </View>
                                        )}
                                        <View
                                            className={clsx("insights-bar", isPeak && "insights-bar-active")}
                                            style={{ height: barHeightFor(bar.amount) }}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    <View className="insights-labels">
                        {weekly.map((bar, index) => (
                            <View key={`label-${bar.label}`} className="insights-label-col">
                                <Text
                                    className={clsx(
                                        "insights-label-text",
                                        index === peakIndex && peakAmount > 0 && "insights-label-text-active",
                                    )}
                                >
                                    {bar.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default InsightsBarChart;
