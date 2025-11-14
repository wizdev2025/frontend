import { View, Pressable, Text, TextInput, ScrollView } from 'react-native';
import { styles } from './styles';
import { useState } from 'react';

export default function Deaf() {
  const [prompt, setPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.');
  const [summary, setSummary] = useState('Summary: User discussed project deadlines and mentioned three action items for next week. Key focus on completing documentation and scheduling team review.');

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  const showSplit = isRecording && prompt.length > 0;

  return (
    <View style={styles.container}>
      <View style={{ flex: 0.25, padding: 10, justifyContent: 'center' }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: isRecording ? '#e0e0e0' : 'white',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            fontSize: 18,
            textAlignVertical: 'top'
          }}
          placeholder="Enter prompt (e.g., 'Summarize focusing on todos')"
          value={prompt}
          onChangeText={setPrompt}
          editable={!isRecording}
          multiline
        />
      </View>

      {showSplit ? (
        <View style={{ flex: 0.5 }}>
          <ScrollView style={{ flex: 0.75, backgroundColor: '#f5f5f5', padding: 10 }}>
            <Text style={{ fontSize: 16 }}>{summary}</Text>
          </ScrollView>
          <ScrollView style={{ flex: 0.25, backgroundColor: 'white', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc' }}>
            <Text style={{ fontSize: 14, color: '#666' }}>{transcript}</Text>
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={{ flex: 0.5, backgroundColor: 'white', padding: 10 }}>
          <Text style={{ fontSize: 16 }}>{transcript}</Text>
        </ScrollView>
      )}

      <Pressable
        style={{ flex: 0.25, backgroundColor: isRecording ? '#F44336' : '#4CAF50', justifyContent: 'center', alignItems: 'center' }}
        onPress={handleRecord}
      >
        <Text style={styles.buttonText}>{isRecording ? 'STOP' : 'RECORD'}</Text>
      </Pressable>
    </View>
  );
}
