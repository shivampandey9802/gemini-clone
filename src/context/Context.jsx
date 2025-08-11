import { createContext, useState, useRef, useEffect } from "react";
import main from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {

    const [input, setInput] = useState("")
    const [recentPrompt, setRecentPrompt] = useState("")
    const [prevPrompt, setPreviousPrompt] = useState([])
    const [showResult, setShowResult] = useState(false)
    const [loading, setLoading] = useState(false)
    const [resultData, setResultData] = useState("")
    const streamingTimeoutIdsRef = useRef([])

    const clearStreamingTimers = () => {
        streamingTimeoutIdsRef.current.forEach((id) => clearTimeout(id))
        streamingTimeoutIdsRef.current = []
    }

    useEffect(() => {
        return () => {
            clearStreamingTimers()
        }
    }, [])

    const delayPara = (index, nextWord) => {
        const id = setTimeout(function () {
            setResultData(prev => prev + nextWord)
        }, 75 * index)
        streamingTimeoutIdsRef.current.push(id)
    }

    const newChat = ()=>{
        clearStreamingTimers()
        setLoading(false)
        setShowResult(false)
        setResultData("")
        setRecentPrompt("")
    }

    const onSent = async (prompt) => {
        clearStreamingTimers()
        setResultData("")
        setLoading(true)
        setShowResult(true)
        try {
            let response
            if(prompt !== undefined && prompt !== null && String(prompt).trim() !== "") {
                response = await main(prompt)
                setRecentPrompt(prompt)
            } else {
                setPreviousPrompt(prev=>[...prev, input])
                setRecentPrompt(input)
                response = await main(input)
            }
            let responseArray = response
                .replace(/^[#\s]+/g, "")
                .replace(/\n#{1,6}\s+/g, "\n")
                .split("**")
            let newResponse=""
            for(let i=0;i<responseArray.length;i++) {
                if(i === 0 || i % 2 !== 1) {
                    newResponse += responseArray[i]
                } else {
                    newResponse += "<b>" + responseArray[i] + "</b>"
                }
            }
            // Only convert double-newlines to paragraph breaks and single newlines to <br/>
            let newResponse2 = newResponse
                .replace(/\r/g, "")
                .replace(/\n{2,}/g, "</p><p>")
                .replace(/(?<!>)\n/g, "<br/>")
            newResponse2 = `<p>${newResponse2}</p>`
            // Collapse redundant spaces
            newResponse2 = newResponse2.replace(/\s{3,}/g, "  ")
            let newResponseArray = newResponse2.split(" ")
            for(let i=0;i<newResponseArray.length;i++) {
                const nextWord = newResponseArray[i]
                delayPara(i, nextWord + " ")
            }
            const finishId = setTimeout(() => {
                setLoading(false)
                setInput("")
            }, 75 * newResponseArray.length + 50)
            streamingTimeoutIdsRef.current.push(finishId)
        } catch (err) {
            setResultData("<b>Sorry, something went wrong. Please try again.</b>")
            setLoading(false)
        }
    }
    const contextValue = {
        prevPrompt,
        setPreviousPrompt,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat
    }
    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider