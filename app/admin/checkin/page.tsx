async function verifyText(text: string) {
  const cleanText = text.trim()
  const plateText = cleanText.toLowerCase()

  setQrText(cleanText)
  setMessage("")
  setMember(null)

  if (!cleanText) {
    setMessage("Enter a QR code value or license plate.")
    return
  }

  let memberData = null

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      cleanText
    )

  if (isUuid) {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("id", cleanText)
      .maybeSingle()

    memberData = data
  }

  if (!memberData) {
    const { data } = await supabase
      .from("members")
      .select("*")
      .ilike("license_plate", plateText)
      .maybeSingle()

    memberData = data
  }

  if (!memberData) {
    setMessage("Member not found.")
    return
  }

  const fullName = `${memberData.first_name || ""} ${
    memberData.last_name || ""
  }`.trim()

  const vehicle = `${memberData.vehicle_color || ""} ${
    memberData.vehicle_make || ""
  } ${memberData.vehicle_model || ""}`.trim()

  setMember({
    memberId: memberData.id,
    email: memberData.email,
    name: fullName,
    plan: memberData.membership_plan || "Prospect",
    vehicle,
    plate: memberData.license_plate || "",
    status: memberData.membership_status || "inactive",
  })

  setMessage("")
}