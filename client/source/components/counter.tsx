import { useState } from "react"
import "../index.css"

export default function Counter() {
	const [ count, setCount ] = useState( 0 )

	return (
		<div className="m-3">
			<h1 className="text-3xl font-bold underline">Hello World!</h1>
			<p>Counter: <code>{ count }</code>.</p>
			<button className="font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700 text-white" onClick={ () => setCount( count + 1 ) }>Increment Counter</button>
		</div>
	)
}
