import JoinForm from "./JoinForm"
import PreopeningApp from "../app/PreopeningApp"
import { preopening } from "@/lib/member/launch"
export default function Page() { return preopening() ? <PreopeningApp /> : <JoinForm /> }
