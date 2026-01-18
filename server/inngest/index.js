import { Inngest } from "inngest";
import User from "../models/userModel.js";
import Connection from "../models/connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/storyModel.js";
import Message from "../models/message.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

//Inngest function to reminder when a new connection request is added 7:55
const sendNewConnectionRequestReminder = inngest.createFunction(
    { id: "send-new-connection-request-reminder" },
    { event: "app/connection-request" },
    async ({ event, step }) => {
        const { connectionId } = event.data

        // Send initial connection request email
        const initialEmailResult = await step.run('send-connection-request-mail', async () => {
            try {
                const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id')

                if (!connection) {
                    console.log(`Connection not found: ${connectionId}`)
                    return { success: false, message: "Connection not found" }
                }

                if (!connection.to_user_id?.email) {
                    console.log(`User email not found for connection: ${connectionId}`)
                    return { success: false, message: "User email not found" }
                }

                const subject = `👋 New Connection Request`
                const body = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #333; margin: 0 0 10px 0;">Hi ${connection.to_user_id.full_name},</h2>
                </div>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; color: #555;"><strong>${connection.from_user_id.full_name}</strong> (@${connection.from_user_id.username}) sent you a connection request</p>
                </div>
                <p style="text-align: center; margin-bottom: 20px;">
                    <a href="${process.env.FRONTEND_URL}/connections" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                    PingUp - Stay Connected<br>
                    © 2025 PingUp. All rights reserved.
                </p>
            </div>`

                await sendEmail({
                    to: connection.to_user_id.email,
                    subject,
                    body
                })

                console.log(`✅ Connection request email sent to ${connection.to_user_id.email}`)
                return { success: true, message: "Connection request email sent" }
            } catch (error) {
                console.error("❌ Error sending connection request email:", error.message)
                return { success: false, message: "Failed to send email", error: error.message }
            }
        })

        // If initial email failed, exit early
        if (!initialEmailResult.success) {
            return initialEmailResult
        }

        // Wait for 24 hours before sending reminder
        await step.sleep("wait-for-24-hours", 24 * 60 * 60 * 1000)

        // Send reminder email after 24 hours
        const reminderResult = await step.run('send-connection-request-reminder', async () => {
            try {
                const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id')

                if (!connection) {
                    console.log(`Connection not found for reminder: ${connectionId}`)
                    return { success: false, message: "Connection not found" }
                }

                // Check if connection was already accepted
                if (connection.status === 'accepted') {
                    console.log(`✅ Connection already accepted: ${connectionId}`)
                    return { success: true, message: "Already accepted, reminder not sent" }
                }

                // Check if connection was rejected
                if (connection.status === 'rejected') {
                    console.log(`✅ Connection was rejected: ${connectionId}`)
                    return { success: true, message: "Rejected, reminder not sent" }
                }

                if (!connection.to_user_id?.email) {
                    console.log(`User email not found for reminder: ${connectionId}`)
                    return { success: false, message: "User email not found" }
                }

                const subject = `👋 Reminder: Connection Request Pending`
                const body = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #333; margin: 0 0 10px 0;">Hi ${connection.to_user_id.full_name},</h2>
                </div>
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0 0 10px 0; color: #555;">You have a pending connection request from <strong>${connection.from_user_id.full_name}</strong> (@${connection.from_user_id.username})</p>
                    <p style="margin: 0; color: #555; font-size: 14px;">This request was sent 24 hours ago.</p>
                </div>
                <p style="text-align: center; margin-bottom: 20px;">
                    <a href="${process.env.FRONTEND_URL}/connections" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept or Reject</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                    PingUp - Stay Connected<br>
                    © 2025 PingUp. All rights reserved.
                </p>
            </div>`

                await sendEmail({
                    to: connection.to_user_id.email,
                    subject,
                    body
                })

                console.log(`✅ Connection request reminder email sent to ${connection.to_user_id.email}`)
                return { success: true, message: "Reminder sent" }
            } catch (error) {
                console.error("❌ Error sending reminder email:", error.message)
                return { success: false, message: "Failed to send reminder", error: error.message }
            }
        })

        return reminderResult
    }
)

//Inngest function to delete story after 24 hours
const deleteStory = inngest.createFunction(
  { id: 'story-delete', batchSize: 10 },
  { event: 'app/story.delete' },
  async ({ event, step }) => {
    try {
      const { storyId } = event.data;
      console.log(`⏰ Story deletion scheduled for story: ${storyId}`);

      if (!storyId) {
        console.error(" Story ID is missing");
        return { message: "Story ID is missing", success: false };
      }

      // Wait for 24 hours using sleep (86400000 milliseconds)
      console.log(`⏳ Sleeping for 24 hours before deleting story ${storyId}`);
      await step.sleep('wait-for-24-hours', 24 * 60 * 60 * 1000);

      // Delete story after 24 hours
      const result = await step.run("delete-story", async () => {
        try {
          const story = await Story.findById(storyId);

          if (!story) {
            console.log(`ℹ️ Story ${storyId} already deleted or not found`);
            return { message: "Story not found", success: true };
          }

          const deletedStory = await Story.findByIdAndDelete(storyId);
          console.log(` Story deleted successfully: ${storyId}`);
          return { message: "Story deleted successfully", success: true, storyId };
        } catch (error) {
          console.error(` Error deleting story ${storyId}:`, error.message);
          return { message: "Failed to delete story", success: false, error: error.message };
        }
      });

      return result;
    } catch (error) {
      console.error(` Error in deleteStory function:`, error.message);
      return { message: "Story deletion function error", success: false, error: error.message };
    }
  }
);

const sendNotificationsOnunseenMessages = inngest.createFunction(
    {id: 'send-unseen-messages-notification'},
    {cron: "TZ=America/New_York 0 9 * * *"}, //Every day at 9 am
    async ({step})=> {
        try {
            const messages = await Message.find({seen: false}).populate('to_user_id')
            const unseenCount = {}

            messages.forEach(message=> {
                if (message.to_user_id && message.to_user_id._id) {
                    unseenCount[message.to_user_id._id] = (unseenCount[message.to_user_id._id] || 0) + 1
                }
            })

            for (const userId in unseenCount) {
                await step.run(`send-unseen-message-${userId}`, async () => {
                    try {
                        const user = await User.findById(userId)

                        if (!user || !user.email) {
                            console.log(`User not found or email missing for userId: ${userId}`)
                            return
                        }

                        const count = unseenCount[userId]
                        const subject = `You have ${count} unseen message${count > 1 ? 's' : ''}`

                        const body = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #333; margin: 0 0 10px 0;">Hi ${user.full_name},</h2>
                </div>
                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #2196F3;">
                    <p style="margin: 0; color: #1976d2; font-size: 16px; font-weight: bold;">You have ${count} unseen message${count > 1 ? 's' : ''}</p>
                </div>
                <p style="text-align: center; margin-bottom: 20px;">
                    <a href="${process.env.FRONTEND_URL}/messages" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Messages</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                    PingUp - Stay Connected<br>
                    © 2025 PingUp. All rights reserved.
                </p>
            </div>
            `

                        await sendEmail({
                            to: user.email,
                            subject,
                            body
                        })

                        console.log(`✅ Unseen messages email sent to ${user.email}`)
                    } catch (error) {
                        console.error(`❌ Error sending unseen messages email to userId ${userId}:`, error.message)
                    }
                })
            }

            return {message: "Unseen message notifications sent"}
        } catch (error) {
            console.error("❌ Error in sendNotificationsOnunseenMessages:", error.message)
            return {message: "Failed to send notifications", error: error.message}
        }
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [
    sendNewConnectionRequestReminder,
    deleteStory,
    sendNotificationsOnunseenMessages
];

