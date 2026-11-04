import JoinForm from "./JoinForm"
import MemberApp from "../app/MemberApp"
import { preopening } from "@/lib/member/launch"
export default function Page() { return preopening() ? <MemberApp preopening initialView="garage" /> : <JoinForm /> }
