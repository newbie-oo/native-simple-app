import { formatCurrency } from "@/lib/utils";
import { Image, Text, View } from "react-native";

const HistoryCard = ({ name, icon, color, dateTime, price, currency, frequency }: HistoryCardProps) => {
    return (
        <View className="history-card" style={color ? { backgroundColor: color } : undefined}>
            <View className="history-main">
                <View className="history-icon-wrap">
                    <Image source={icon} className="history-icon" />
                </View>
                <View className="history-copy">
                    <Text className="history-name" numberOfLines={1}>
                        {name}
                    </Text>
                    <Text className="history-date" numberOfLines={1}>
                        {dateTime}
                    </Text>
                </View>
            </View>

            <View className="history-price-box">
                <Text className="history-price">{formatCurrency(price, currency)}</Text>
                <Text className="history-freq">
                    {frequency === "Yearly" ? "per year" : "per month"}
                </Text>
            </View>
        </View>
    );
};

export default HistoryCard;
