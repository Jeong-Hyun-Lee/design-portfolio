import { Component } from 'react'

/**
 * Keeps a failed 3D chunk (network error, no WebGL) from taking the whole page down.
 * React still reports the caught error in the console. Error boundaries must be classes.
 */
export default class SceneBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? (this.props.fallback ?? null) : this.props.children
  }
}
