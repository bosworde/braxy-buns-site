import { MemberError } from "./server"

export function preopeningDetails(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new MemberError("Please check your registration details.", 400)
  const input = body as Record<string, unknown>
  const details: Record<string, string> = {}
  for (const field of ["first_name", "last_name", "vehicle_make", "vehicle_model", "vehicle_color", "license_plate"]) {
    if (typeof input[field] !== "string" || input[field].trim().length > 50) throw new MemberError("Please check your name and vehicle details.", 400)
    details[field] = input[field].trim()
  }
  if (!details.first_name || !details.last_name) throw new MemberError("Enter your first and last name.", 400)
  if (!["Gecko", "Iguana", "Dragon"].includes(String(input.preferred_plan))) throw new MemberError("Choose a preferred wash club.", 400)
  details.preferred_plan = String(input.preferred_plan)
  details.license_plate = details.license_plate.replace(/\s+/g, "").toUpperCase()
  if (details.license_plate && !/^[A-Z0-9-]{2,10}$/.test(details.license_plate)) throw new MemberError("Enter a valid license plate or leave it blank for now.", 400)
  return details
}
