import { Text, View, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChatMessage } from '../../services/chat/chatService';

export default function MessageBubble({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(180)}>
      <View
        className={`mb-2 max-w-[82%] px-4 py-3 ${
          isMine
            ? 'self-end rounded-[20px] rounded-br-md bg-[#4F7CFF]'
            : 'self-start rounded-[20px] rounded-bl-md bg-[#F3F4F6]'
        }`}
      >
        {!isMine && message.senderLabel ? (
          <Text className="mb-1 text-xs font-semibold text-slate-500">{message.senderLabel}</Text>
        ) : null}

        {message.type === 'text' ? (
          <Text className={`${isMine ? 'text-white' : 'text-slate-900'} text-[15px]`}>{message.text}</Text>
        ) : null}

        {message.type !== 'text' && message.mediaUrl ? (
          message.type === 'image' ? (
            <Image source={{ uri: message.mediaUrl }} className="h-52 w-56 rounded-2xl" resizeMode="cover" />
          ) : (
            <View className="rounded-2xl bg-slate-900/10 px-3 py-4">
              <Text className={`${isMine ? 'text-white' : 'text-slate-900'} font-medium`}>Video message</Text>
              <Text className={`${isMine ? 'text-white/85' : 'text-slate-600'} mt-0.5 text-xs`}>
                Tap-to-play integration ready for hookup.
              </Text>
            </View>
          )
        ) : null}
      </View>
    </Animated.View>
  );
}
