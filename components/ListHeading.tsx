import { Text, TouchableOpacity, View } from 'react-native'

const ListHeading = ({ title, actionLabel = "View All", onActionPress }: ListHeadingProps) => {
    return (
        <View className='list-head'>
            <Text className='list-title'>{title}</Text>
            <TouchableOpacity className='list-action' onPress={onActionPress} disabled={!onActionPress}>
                <Text className='list-action-text'>{actionLabel}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ListHeading
