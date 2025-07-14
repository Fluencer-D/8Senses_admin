import { v2 as cloudinary } from "cloudinary"
import { type NextRequest, NextResponse } from "next/server"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(req: NextRequest) {
  try {
    const { folder, resource_type } = await req.json()

    if (!folder || !resource_type) {
      return NextResponse.json({ error: "Missing folder or resource_type in request body" }, { status: 400 })
    }

    const timestamp = Math.round(new Date().getTime() / 1000)
    const params = {
      timestamp: timestamp,
      folder: folder,
      resource_type: resource_type,
    }

    const signature = cloudinary.utils.api_sign_request(params, cloudinary.config().api_secret as string)

    return NextResponse.json({
      signature,
      timestamp,
      api_key: cloudinary.config().api_key,
      cloud_name: cloudinary.config().cloud_name,
    })
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error)
    return NextResponse.json({ error: "Failed to generate Cloudinary signature" }, { status: 500 })
  }
}
