import { useState } from "react"

export default function Counter() {
	const [ count, setCount ] = useState(0)

	return (
		<div>
			<h1>Hello World!</h1>
			<p>Counter: { count }</p>
			<button onClick={ () => setCount( count + 1 ) }>Increment Counter</button>
		</div>
	)
}
