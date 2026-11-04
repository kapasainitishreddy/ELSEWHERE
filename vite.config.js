import { defineConfig } from 'vite';

function sceneRetryUrlPlugin(){
  return {
    name:'elsewhere-scene-retry-url',
    apply:'build',
    generateBundle(_options,bundle){
      const outputs=Object.values(bundle);
      const scene=outputs.find(file=>file.type==='chunk'&&file.fileName.startsWith('assets/worlds-'));
      const entry=outputs.find(file=>file.type==='chunk'&&file.isEntry);
      if(!scene||!entry)throw new Error('Could not resolve the ELSEWHERE scene retry chunk URL.');
      const marker=/(["'])__ELSEWHERE_SCENE_CHUNK_URL__\1/g;
      if(!marker.test(entry.code))throw new Error('The ELSEWHERE scene retry URL marker is missing from the application entry.');
      entry.code=entry.code.replace(marker,JSON.stringify(`/${scene.fileName}`));
    }
  };
}

export default defineConfig({
  plugins:[sceneRetryUrlPlugin()],
  server: { host: '127.0.0.1', proxy: { '/api/local-dialogue': 'http://127.0.0.1:8788', '/api': 'http://127.0.0.1:8787' } },
  preview: { host: '127.0.0.1' },
  build: { target: 'es2022', rollupOptions:{output:{minifyInternalExports:false}} }
});
