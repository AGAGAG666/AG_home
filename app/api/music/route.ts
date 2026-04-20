import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), 'public', 'music');
    
    // 检查目录是否存在
    if (!fs.existsSync(musicDir)) {
      return NextResponse.json({ tracks: [] });
    }

    // 读取目录中的所有文件
    const files = fs.readdirSync(musicDir);
    
    // 过滤出音频文件
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
    const audioFiles = files.filter((file: string) => {
      const ext = path.extname(file).toLowerCase();
      return audioExtensions.includes(ext);
    });

    // 按文件名排序
    audioFiles.sort();

    // 构建track列表
    const tracks = audioFiles.map((file: string, index: number) => {
      const nameWithoutExt = file.replace(/\.[^/.]+$/, '');
      return {
        id: `server-${index}`,
        name: nameWithoutExt,
        url: `/music/${file}`,
        duration: 0, // 前端加载后会更新
        isServerFile: true
      };
    });

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Failed to read music directory:', error);
    return NextResponse.json({ tracks: [], error: 'Failed to read music directory' }, { status: 500 });
  }
}
