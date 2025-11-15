import { View, Pressable, Text, TextInput, ScrollView, Alert } from 'react-native';
import { styles } from './styles';
import { useState } from 'react';
import { WhisperClient } from './whisperClient';

export default function Deaf() {
  const [prompt, setPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'single' | 'split'>('single');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');

  const [client] = useState(() => new WhisperClient(
    '192.168.89.136',
    9090,
    (text) => setTranscript(text)
  ));

  const handleRecord = async () => {
    if (!isRecording) {
      try {
        setRecordingMode(prompt.length > 0 ? 'split' : 'single');
        setTranscript('');
        await client.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('[Deaf] ✗ Recording failed:', error);
        Alert.alert('Recording Failed', String(error));
      }
    } else {
      try {
        await client.stopRecording();
        setIsRecording(false);
      } catch (error) {
        console.error('[Deaf] ✗ Transcription failed:', error);
        Alert.alert('Transcription Failed', String(error));
        setIsRecording(false);
      }
    }
  };

  const showSplit = recordingMode === 'split';

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
