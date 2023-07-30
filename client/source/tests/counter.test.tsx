import { render } from "@testing-library/react"
import Counter from "../components/counter"

describe( "Counter", () => {
	it( "Render", () => {
		render( <Counter /> )
	} )
} )
