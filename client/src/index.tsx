import 'regenerator-runtime/runtime'
import React from 'react'
import { createRoot } from 'react-dom/client'  //createRoot APIを使用して、Reactアプリケーションのルートコンテナを作成
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'

import './index.scss'
import './PhaserGame'
import muiTheme from './MuiTheme'
import App from './App'
import store from './stores'

const container = document.getElementById('root') //HTMLドキュメントからid="root"の要素を取得
const root = createRoot(container!) //container要素を使用してReactのルートを作成
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={muiTheme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)
