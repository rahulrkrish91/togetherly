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
        className={`mb-2 max-w-[85%] rounded-2xl px-3 py-2 ${
          isMine ? 'self-end bg-brand' : 'self-start bg-white'
        }`}
      >
        {!isMine && message.senderLabel ? (
          <Text className="mb-1 text-xs font-semibold text-slate-500">{message.senderLabel}</Text>
        ) : null}

        {message.type === 'text' ? (
          <Text className={`${isMine ? 'text-white' : 'text-slate-900'}`}>{message.text}</Text>
        ) : null}

        {message.type !== 'text' && message.mediaUrl ? (
          message.type === 'image' ? (
            <Image source={{ uri: message.mediaUrl }} className="h-48 w-56 rounded-xl" resizeMode="cover" />
          ) : (
            <View className="rounded-xl bg-slate-900/15 px-3 py-4">
              <Text className={`${isMine ? 'text-white' : 'text-slate-900'}`}>Video uploaded</Text>
              <Text className={`${isMine ? 'text-white/80' : 'text-slate-600'} text-xs`}>
                Tap-to-play integration next.
              </Text>
            </View>
          )
        ) : null}
      </View>
    </Animated.View>
  );
}
