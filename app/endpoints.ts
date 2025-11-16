const BASE_CLUSTER = 'cluster-xj5jp.xj5jp.sandbox664.opentlc.com';

export const ENDPOINTS = {
  VLM_DESCRIBE: `https://vllm-app-openshift-terminal.apps.${BASE_CLUSTER}/describe_image`,
  VLM_SUMMARIZE: `https://vllm-app-openshift-terminal.apps.${BASE_CLUSTER}/summarize_text_granite`,
  WHISPER_TRANSCRIBE: `https://whisper-http-openshift-terminal.apps.cluster-xj5jp.xj5jp.sandbox664.opentlc.com/transcribe_audio`,
  TTS: `https://whisper-speech-openshift-terminal.apps.cluster-xj5jp.xj5jp.sandbox664.opentlc.com/tts/`,
};
