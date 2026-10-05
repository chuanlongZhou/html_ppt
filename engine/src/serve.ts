/** 极简静态文件服务器（check 与 dev 共用） */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

export type Hook = (req: http.IncomingMessage, res: http.ServerResponse) => boolean;

export function serveStatic(root: string, port: number, hook?: Hook, transformHtml?: (html: string) => string): Promise<{ server: http.Server; port: number }> {
  const server = http.createServer((req, res) => {
    if (hook && hook(req, res)) return;
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = path.join(root, url);
    if (!file.startsWith(root)) return void res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) return void res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404 ' + url);
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'content-type': MIME[ext] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    if (ext === '.html' && transformHtml) res.end(transformHtml(fs.readFileSync(file, 'utf8')));
    else fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => {
    // 端口被占用时，先在原端口上重试几秒（dev 热重启时旧进程还没释放端口），再顺延到下一个端口
    const tryListen = (p: number, left: number, same: number) => {
      server.once('error', (e: any) => {
        if (e.code !== 'EADDRINUSE' || port === 0) return reject(e);
        if (same > 0) setTimeout(() => tryListen(p, left, same - 1), 250);
        else if (left > 0) tryListen(p + 1, left - 1, 0);
        else reject(e);
      });
      server.listen(p, '127.0.0.1', () => resolve({ server, port: (server.address() as any).port }));
    };
    tryListen(port, 20, 16);
  });
}
