/**
 * Top-of-tree React error boundary. Catches render / lifecycle errors anywhere
 * below it, logs to the console, and shows a friendly fallback with the error
 * message + recovery actions ("Reload page" full reload, "Try again" reset
 * boundary state only). Class component because hooks don't expose
 * componentDidCatch.
 */
import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className='error-boundary'>
          <svg className='error-boundary-icon' xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
            <line x1='12' y1='9' x2='12' y2='13' />
            <line x1='12' y1='17' x2='12.01' y2='17' />
          </svg>
          <h1 className='error-boundary-title'>Something went wrong</h1>
          <p className='error-boundary-sub'>An unexpected error stopped the page from rendering.</p>
          <pre className='error-boundary-detail'>{String(this.state.error)}</pre>
          <div className='error-boundary-actions'>
            <button onClick={() => window.location.reload()} className='error-boundary-btn'>Reload page</button>
            <button onClick={this.reset} className='error-boundary-btn error-boundary-btn--outline'>Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
