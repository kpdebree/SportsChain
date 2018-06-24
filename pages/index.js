import {Component} from 'react'
import fetch from '../lib/fetch'
import Page from '../components/page'

const hashNotJson = 'Qmf6xsQkUgVSoEq65wGbsZ4rnpzRxNqEDZPK7DhBVEKRr5'
const hash0 = 'QmTQqczEPUzyaArjSzpLqH2EGQ2y8Mzc3AY9wR5u1XsgjL'

export default class extends Component {
  static async getInitialProps({pathname}) {
    return {
      blockchain: await fetch(hash0)
    }
  }
  render() {
    return (
      <Page>
        <h1>SportsChain</h1>
        <div>{JSON.stringify(this.props.blockchain)}</div>
      </Page>
    )
  }
}
