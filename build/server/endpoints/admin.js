const { ApiKey } = require("../models/apiKeys");
const { Document } = require("../models/documents");
const { EventLogs } = require("../models/eventLogs");
const { Invite } = require("../models/invite");
const { SystemSettings } = require("../models/systemSettings");
const { Telemetry } = require("../models/telemetry");
const { User } = require("../models/user");
const { DocumentVectors } = require("../models/vectors");
const { Workspace } = require("../models/workspace");
const { WorkspaceChats } = require("../models/workspaceChats");
const {
  getVectorDbClass,
  getEmbeddingEngineSelection,
} = require("../utils/helpers");
const {
  validRoleSelection,
  canModifyAdmin,
  validCanModify,
} = require("../utils/helpers/admin");
const { reqBody, userFromSession, safeJsonParse } = require("../utils/http");
const {
  strictMultiUserRoleValid,
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const { MetadataFactory } = require("../utils/sso/metadataFactory");

function adminEndpoints(app) {
  if (!app) return;

  app.get(
    "/admin/users",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (_request, response) => {
      try {
        const users = await User.where();
        response.status(200).json({ users });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/admin/users/new",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const currUser = await userFromSession(request, response);
        const newUserParams = reqBody(request);
        const roleValidation = validRoleSelection(currUser, newUserParams);

        if (!roleValidation.valid) {
          response
            .status(200)
            .json({ user: null, error: roleValidation.error });
          return;
        }

        const { user: newUser, error } = await User.create(newUserParams);
        if (!!newUser) {
          await EventLogs.logEvent(
            "user_created",
            {
              userName: newUser.username,
              createdBy: currUser.username,
            },
            currUser.id
          );
        }

        response.status(200).json({ user: newUser, error });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/admin/user/:id",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const currUser = await userFromSession(request, response);
        const { id } = request.params;
        const updates = reqBody(request);
        const user = await User.get({ id: Number(id) });

        const canModify = validCanModify(currUser, user);
        if (!canModify.valid) {
          response.status(200).json({ success: false, error: canModify.error });
          return;
        }

        const roleValidation = validRoleSelection(currUser, updates);
        if (!roleValidation.valid) {
          response
            .status(200)
            .json({ success: false, error: roleValidation.error });
          return;
        }

        const validAdminRoleModification = await canModifyAdmin(user, updates);
        if (!validAdminRoleModification.valid) {
          response
            .status(200)
            .json({ success: false, error: validAdminRoleModification.error });
          return;
        }

        const { success, error } = await User.update(id, updates);
        response.status(200).json({ success, error });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/admin/user/:id",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const currUser = await userFromSession(request, response);
        const { id } = request.params;
        const user = await User.get({ id: Number(id) });

        const canModify = validCanModify(currUser, user);
        if (!canModify.valid) {
          response.status(200).json({ success: false, error: canModify.error });
          return;
        }

        await User.delete({ id: Number(id) });
        await EventLogs.logEvent(
          "user_deleted",
          {
            userName: user.username,
            deletedBy: currUser.username,
          },
          currUser.id
        );
        response.status(200).json({ success: true, error: null });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/admin/invites",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (_request, response) => {
      try {
        const invites = await Invite.whereWithUsers();
        response.status(200).json({ invites });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/admin/invite/new",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const body = reqBody(request);
        const { invite, error } = await Invite.create({
          createdByUserId: user.id,
          workspaceIds: body?.workspaceIds || [],
        });

        await EventLogs.logEvent(
          "invite_created",
          {
            inviteCode: invite.code,
            createdBy: response.locals?.user?.username,
          },
          response.locals?.user?.id
        );
        response.status(200).json({ invite, error });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/admin/invite/:id",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { id } = request.params;
        const { success, error } = await Invite.deactivate(id);
        await EventLogs.logEvent(
          "invite_deleted",
          { deletedBy: response.locals?.user?.username },
          response.locals?.user?.id
        );
        response.status(200).json({ success, error });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/admin/workspaces",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (_request, response) => {
      try {
        const workspaces = await Workspace.whereWithUsers();
        response.status(200).json({ workspaces });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/admin/workspaces/:workspaceId/users",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { workspaceId } = request.params;
        const users = await Workspace.workspaceUsers(workspaceId);
        response.status(200).json({ users });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/admin/workspaces/new",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const { name } = reqBody(request);
        const { workspace, message: error } = await Workspace.new(
          name,
          user.id
        );
        response.status(200).json({ workspace, error });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/admin/workspaces/:workspaceId/update-users",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { workspaceId } = request.params;
        const { userIds } = reqBody(request);
        const { success, error } = await Workspace.updateUsers(
          workspaceId,
          userIds
        );
        response.status(200).json({ success, error });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/admin/workspaces/:id",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { id } = request.params;
        const VectorDb = getVectorDbClass();
        const workspace = await Workspace.get({ id: Number(id) });
        if (!workspace) {
          response.sendStatus(404).end();
          return;
        }

        await WorkspaceChats.delete({ workspaceId: Number(workspace.id) });
        await DocumentVectors.deleteForWorkspace(Number(workspace.id));
        await Document.delete({ workspaceId: Number(workspace.id) });
        await Workspace.delete({ id: Number(workspace.id) });
        try {
          await VectorDb["delete-namespace"]({ namespace: workspace.slug });
        } catch (e) {
          console.error(e.message);
        }

        response.status(200).json({ success: true, error: null });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  // TODO: Allow specification of which props to get instead of returning all of them all the time.
  app.get(
    "/admin/system-preferences",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (_, response) => {
      try {
        const embedder = getEmbeddingEngineSelection();
        const settings = {
          limit_user_messages:
            (await SystemSettings.get({ label: "limit_user_messages" }))
              ?.value === "true",
          message_limit:
            Number(
              (await SystemSettings.get({ label: "message_limit" }))?.value
            ) || 10,
          enabled_adfs_sso:
            (await SystemSettings.get({ label: "enabled_adfs_sso" }))
              ?.value === "true",
          adfs_sso_url:
            (await SystemSettings.get({ label: "adfs_sso_url" }))?.value || process.env.SAML_ENTRY_POINT,
          adfs_sso_callback:
            (await SystemSettings.get({ label: "adfs_sso_callback" }))?.value || process.env.SAML_CALLBACK_HOST,
          adfs_sso_issuer:
            (await SystemSettings.get({ label: "adfs_sso_issuer" }))?.value || process.env.SAML_ISSUER,
          adfs_sso_state:
            (await SystemSettings.get({ label: "adfs_sso_state" }))?.value ||
            JSON.stringify([]),
          footer_data:
            (await SystemSettings.get({ label: "footer_data" }))?.value ||
            JSON.stringify([]),
          support_email:
            (await SystemSettings.get({ label: "support_email" }))?.value ||
            null,
          text_splitter_chunk_size:
            (await SystemSettings.get({ label: "text_splitter_chunk_size" }))
              ?.value ||
            embedder?.embeddingMaxChunkLength ||
            null,
          text_splitter_chunk_overlap:
            (await SystemSettings.get({ label: "text_splitter_chunk_overlap" }))
              ?.value || null,
          max_embed_chunk_size: embedder?.embeddingMaxChunkLength || 1000,
          agent_search_provider:
            (await SystemSettings.get({ label: "agent_search_provider" }))
              ?.value || null,
          agent_sql_connections:
            await SystemSettings.brief.agent_sql_connections(),
          default_agent_skills:
            safeJsonParse(
              (await SystemSettings.get({ label: "default_agent_skills" }))
                ?.value,
              []
            ) || [],
          custom_app_name:
            (await SystemSettings.get({ label: "custom_app_name" }))?.value ||
            null,
          feature_flags: (await SystemSettings.getFeatureFlags()) || {},
          meta_page_title: await SystemSettings.getValueOrFallback(
            { label: "meta_page_title" },
            null
          ),
          meta_page_favicon: await SystemSettings.getValueOrFallback(
            { label: "meta_page_favicon" },
            null
          ),
        };
        response.status(200).json({ settings });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/admin/system-preferences",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const updates = reqBody(request);
        await SystemSettings.updateSettings(updates);
        response.status(200).json({ success: true, error: null });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/admin/system-preferences-sso",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const currentTimestamp = new Date().toISOString();
        const updates = reqBody(request);
        const enabledSSOMode = updates['enabled_adfs_sso'];
        if (enabledSSOMode) {
          let customData = null;
          switch (updates['adfs_sso_state']) {
            // Generate ADFS SSO Configuration File
            case 1:
              const adfsConfig = await MetadataFactory.validateADFSSettings(updates);
              customData = {
                success: true,
                error: null,
                data: {
                  // Include only the properties you want to send back
                  adfsSettings: adfsConfig,
                  // Add any additional data you want to include
                  timestamp: `${currentTimestamp}`,
                },
              };
              break;
            case 2:
              //@DEBUG @SSO - (C)ktchan - for adfs sso
              try {
                const adfs_cert = await MetadataFactory.getADFSCertificate(updates);
                customData = {
                  success: true,
                  error: null,
                };
              } catch (error) {
                // 如果有错误，那么Promise就是被拒绝的
                console.error('ADFS certificate is rejected:', error);
                function safeStringifyError(error) {
                  const { name, message, stack } = error;
                  return JSON.stringify({ name, message, stack }, null, 2);
                }
                customData = {
                  success: false,
                  error: safeStringifyError(error),
                };
              }
              break;
            case 3:
              // Convert to ADFS SSO
              await SystemSettings.updateSettings(updates);
              customData = {
                success: true,
                error: null,
              };
              await Telemetry.sendTelemetry("updated_sso_mode",  { SSOMode: false, createdBy: user?.username });
              await EventLogs.logEvent("updated_sso_mode", { SSOMode: true, createdBy: user?.username }, user?.id);
              break;
            default:
              customData = {
                success: false,
                error: 'Internal Server Error: adfs sso state is not defined.',
              };
          };
          response.status(200).json(customData);
        }
        else {
          let customData = null;
          switch (updates['adfs_sso_state']) {
            // Generate ADFS SSO Configuration File
            case -1:
              // Convert to ADFS SSO
              await SystemSettings.updateSettings(updates);
              customData = {
                success: true,
                error: null,
              };
              await Telemetry.sendTelemetry("updated_sso_mode",  { SSOMode: false, createdBy: user?.username });
              await EventLogs.logEvent("updated_sso_mode", { SSOMode: false, createdBy: user?.username }, user?.id);
              break;
            default:
              customData = {
                success: false,
                error: 'Internal Server Error: adfs sso state is not defined.',
              };
          }
          response.status(200).json(customData);
        }
      } catch (e) {
        console.error(e);
        response.status(500).json({ success: false, error: 'Internal Server Error', data: null });
      }
    }
  );


  app.get(
    "/admin/api-keys",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin])],
    async (_request, response) => {
      try {
        const apiKeys = await ApiKey.whereWithUser({});
        return response.status(200).json({
          apiKeys,
          error: null,
        });
      } catch (error) {
        console.error(error);
        response.status(500).json({
          apiKey: null,
          error: "Could not find an API Keys.",
        });
      }
    }
  );

  app.post(
    "/admin/generate-api-key",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const { apiKey, error } = await ApiKey.create(user.id);

        await Telemetry.sendTelemetry("api_key_created");
        await EventLogs.logEvent(
          "api_key_created",
          { createdBy: user?.username },
          user?.id
        );
        return response.status(200).json({
          apiKey,
          error,
        });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/admin/delete-api-key/:id",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { id } = request.params;
        await ApiKey.delete({ id: Number(id) });

        await EventLogs.logEvent(
          "api_key_deleted",
          { deletedBy: response.locals?.user?.username },
          response?.locals?.user?.id
        );
        return response.status(200).end();
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );
}

module.exports = { adminEndpoints };
