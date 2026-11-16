import { spawn, type ChildProcess } from 'node:child_process'

// Starts the production build (`npm run build` first) on a free localhost port.
// Only loopback URLs are passed in, so nothing leaves the machine.
export async function startNext(env: Record<string, string>) {
  const next: ChildProcess = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', 'localhost', '--port', '0'], {
    env: { PATH: process.env.PATH, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1', ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const url = await new Promise<string>((resolve, reject) => {
    let output = ''
    const ready = (chunk: Buffer) => {
      output += chunk.toString()
      const match = output.match(/http:\/\/localhost:\d+/)
      if (match && output.includes('Ready')) resolve(match[0])
    }
    next.stdout?.on('data', ready)
    next.stderr?.on('data', ready)
    next.once('error', reject)
    next.once('exit', code => reject(Error(`Fixture Next exited (${code})`)))
  })
  return {
    url,
    async stop() {
      if (!next.pid || next.exitCode !== null || next.signalCode !== null) return
      await new Promise<void>(resolve => {
        next.once('exit', () => resolve())
        next.kill()
      })
    },
  }
}
