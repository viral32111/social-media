import React from "react"
import ReactDOM from "react-dom/client"
import $ from "jquery"

import Counter from "./components/counter"

ReactDOM.createRoot( $( "#root" )[ 0 ]! ).render(
	<React.StrictMode>
		<Counter />
	</React.StrictMode>
)
