import { useAtomValue } from 'jotai'
import { Icons } from 'app/libs/icons/icons.class'
import { SiteIcon } from 'app/components/remotes/remote-card.component'
import { DropboxIcon, dropboxAccountLabel, useDropboxAccount } from 'app/components/remotes/dropbox-icon.component'
import { DROPBOX_PROJECTS_FOLDER } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { DropboxFolderField } from 'app/components/remotes/dropbox-picker.component'
import { FORM_ELEMENTS_CSS_CLASSES } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { ACCESS_LEVEL_LABELS, DEFAULT_ACCESS_LEVEL, WORD_PRESS_ROLE_WEIGHT, WORDPRESS_PLUGIN_NAME, WORDPRESS_PLUGIN_URL } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC, ReactNode } from 'react'
import type { IWordPressRemoteInfo, TAccessLevel } from 'app/libs/cloud-sync/wordpress/wordpress.const'

/** @internal */
export type TStorageChoice =
  | { kind: 'local' }
  | { kind: 'remote'; remoteId: string; accessLevel: TAccessLevel }
  | { kind: 'connect'; siteUrl: string; accessLevel: TAccessLevel }
  /** In Dropbox: the connected account, or the one the user logs in with, in the given folder. */
  | { kind: 'dropbox'; folder: string }

/**
 * Whether the choice is a WordPress site, where the project has an access level.
 */
const isWordPressChoice = (choice: TStorageChoice): choice is Extract<TStorageChoice, { accessLevel: TAccessLevel }> => (
  choice.kind === 'remote' || choice.kind === 'connect'
)

/**
 * Sites where the user can create projects.
 * @featurePart storage.choice
 */
export const useWritableRemotes = (): Array<IWordPressRemoteInfo> => (
  useAtomValue(SyncStateAtoms.wordPressRemotes).filter(remote => (
    !remote.needsReauth && (remote.data.can_create_projects ?? WORD_PRESS_ROLE_WEIGHT[remote.data.user_role] >= WORD_PRESS_ROLE_WEIGHT[remote.data.can_create_projects_role])
  ))
)

/**
 * The storage proposed by default: the first connected site, otherwise Dropbox if connected, otherwise this device.
 * When the project must leave this device, Dropbox: it needs nothing more than a login.
 * @featurePart storage.choice
 */
export const defaultStorageChoice = (remotes: Array<IWordPressRemoteInfo>, allowLocal: boolean, dropboxIsWritable: boolean): TStorageChoice => {
  if (remotes.length) {
    return { kind: 'remote', remoteId: remotes[0].remoteId, accessLevel: DEFAULT_ACCESS_LEVEL }
  }
  if (dropboxIsWritable || !allowLocal) {
    return { kind: 'dropbox', folder: DROPBOX_PROJECTS_FOLDER }
  }
  return { kind: 'local' }
}

interface IOptionCardProps {
  id: string
  selected: boolean
  onSelect: () => void
  icon: ReactNode
  title: string
  badge?: { label: string; className: string }
  children?: ReactNode
}

const OptionCard: FC<IOptionCardProps> = (props) => (
  <label
    htmlFor={props.id}
    className={`block rounded-xl border p-3.5 cursor-pointer transition ${props.selected ? 'border-[#2d96ff] bg-[#f4f8fe] shadow-[0_0_0_3px_rgba(45,150,255,0.14)]' : 'border-[#e1e8f1] hover:border-[#c3d0e0] bg-white'}`}
  >
    <div className="flex items-start gap-3">
      <input
        id={props.id}
        type="radio"
        name="storageChoice"
        className="mt-1"
        checked={props.selected}
        onChange={props.onSelect}
      />
      <div className="shrink-0">{props.icon}</div>
      <div className="min-w-0 grow">
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-semibold text-[#0b1f36]">{props.title}</span>
          {props.badge && <span className={`text-xs rounded-full px-2 py-0.5 ${props.badge.className}`}>{props.badge.label}</span>}
        </div>
        {props.children}
      </div>
    </div>
  </label>
)

const RECOMMENDED = { label: 'Recommended', className: 'bg-green-100 text-green-800' }

interface IStorageChoiceProps {
  value: TStorageChoice
  onChange: (value: TStorageChoice) => void
  allowLocal: boolean
}

/**
 * Where a project is stored: on a connected WordPress site, in Dropbox, on a site to connect now, or only on this device.
 *
 * @feature storage.choice
 * @title Choose where a project is stored
 * @summary Chooses whether a project is kept in Dropbox, on a WordPress site, or only on this device, when creating it, in its settings, or later for a local project.
 * @where The storage options when creating a project from a template; "Remote storage" in the project settings; the dialog "Keep your project safe" opened from "Save it in Dropbox or WordPress", the "Only on this device" header badge or "Keep it safe" on a project card.
 * @usage 1. Pick one of the options (the recommended one is marked "Recommended"). 2. For Dropbox, optionally change the folder; for WordPress, choose "Who can see it on the site"; for a new site, type its address. 3. Confirm with the button, whose label says what happens: "Save on <site>", "Save in Dropbox", "Connect Dropbox and save", "Connect and save", "Create and connect Dropbox", "Create and connect WordPress". Choosing a service not yet connected opens its login and brings you back to the project.
 * @options Each connected WordPress site where you can create projects, "Dropbox" (or "My Dropbox" if not connected yet), "My WordPress site" / "Another WordPress site" (connect a new site), "Only on this device" (not offered when moving a local project). Default: the first connected site, otherwise Dropbox, otherwise this device; Dropbox is recommended when no site is connected. In the project settings, "None: this device only" and "Connect storage" when nothing is connected.
 * @rules "Only on this device" is saved only in this browser, with no backup: clearing browsing data, private browsing or losing the device deletes it; it can be moved to Dropbox or WordPress later. Changing or removing the storage of a synced project asks "Stop syncing with <name>?": the project is not deleted, it stays on this device and in Dropbox or on the site. "Not now" closes the dialog. Errors are shown as "The project was not saved" with the message of the service.
 * @errors none
 * @status beta
 * @since 1.0.0
 * @related storage.local-only, sync.dropbox-projects, sync.wordpress-projects, sync.wordpress-share
 */
export const StorageChoice: FC<IStorageChoiceProps> = (props) => {
  const remotes = useWritableRemotes()
  const dropboxAccount = useDropboxAccount()
  const dropboxIsWritable = !!dropboxAccount && !dropboxAccount.needsReauth
  const accessLevel = isWordPressChoice(props.value) ? props.value.accessLevel : DEFAULT_ACCESS_LEVEL
  // The first connected site, otherwise Dropbox: never "only on this device".
  const recommended: 'remote' | 'dropbox' = remotes.length ? 'remote' : 'dropbox'

  return (
    <div className="space-y-2">
      {remotes.map((remote, index) => (
        <OptionCard
          key={remote.remoteId}
          id={`storage-${remote.remoteId}`}
          selected={props.value.kind === 'remote' && props.value.remoteId === remote.remoteId}
          onSelect={() => props.onChange({ kind: 'remote', remoteId: remote.remoteId, accessLevel })}
          icon={<SiteIcon
            remote={remote}
            sizeClassName="w-8 h-8"
                />}
          title={remote.data.site_name || remote.remoteId}
          badge={index === 0 && recommended === 'remote' ? RECOMMENDED : undefined}
        >
          <p className="text-sm text-gray-600">Saved on your WordPress site: backed up, available on all your devices, shareable with the site&apos;s users.</p>
        </OptionCard>
      ))}

      <OptionCard
        id="storage-dropbox"
        selected={props.value.kind === 'dropbox'}
        onSelect={() => props.onChange({ kind: 'dropbox', folder: props.value.kind === 'dropbox' ? props.value.folder : DROPBOX_PROJECTS_FOLDER })}
        icon={<DropboxIcon sizeClassName="w-8 h-8 rounded-[9px] text-base" />}
        title={dropboxIsWritable ? 'Dropbox' : 'My Dropbox'}
        badge={recommended === 'dropbox' ? RECOMMENDED : undefined}
      >
        {dropboxIsWritable
          ? (
            <>
              <p className="text-sm text-gray-600">Saved in the Dropbox of {dropboxAccountLabel(dropboxAccount)}: backed up, available on all your devices.</p>
              {props.value.kind === 'dropbox' && (
                <div className="mt-2">
                  <DropboxFolderField
                    value={props.value.folder}
                    onChange={(folder) => props.onChange({ kind: 'dropbox', folder })}
                  />
                </div>
              )}
            </>)
          : (
            <>
              <p className="text-sm text-gray-600">Saved in your Dropbox: backed up, available on all your devices. Nothing to install.</p>
              {props.value.kind === 'dropbox' && (
                <p className="text-xs text-gray-500 mt-1">{dropboxAccount?.needsReauth ? 'Your Dropbox session has expired: you will log in again' : 'You will log in to Dropbox'} and come back here.</p>
              )}
            </>)}
      </OptionCard>

      <OptionCard
        id="storage-connect"
        selected={props.value.kind === 'connect'}
        onSelect={() => props.onChange({ kind: 'connect', siteUrl: props.value.kind === 'connect' ? props.value.siteUrl : '', accessLevel })}
        icon={<span className="ui-avatar w-8 h-8 rounded-[9px]">{Icons.render('logoWordpress')}</span>}
        title={remotes.length ? 'Another WordPress site' : 'My WordPress site'}
      >
        <p className="text-sm text-gray-600">Saved on a WordPress site you own: backed up, available on all your devices, shareable with the site&apos;s users.</p>
        {props.value.kind === 'connect' && (
          <div className="mt-2">
            <input
              type="url"
              inputMode="url"
              placeholder="https://example.com"
              aria-label="Address of the WordPress site"
              value={props.value.siteUrl}
              onChange={(event) => props.onChange({ kind: 'connect', siteUrl: event.target.value, accessLevel })}
              className={`${FORM_ELEMENTS_CSS_CLASSES} w-full px-3 py-2 text-sm`}
            />
            <p className="text-xs text-gray-500 mt-1">
              The site needs the free
              {' '}
              <a
                href={WORDPRESS_PLUGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {WORDPRESS_PLUGIN_NAME}
              </a>
              {' '}
              plugin. You will log in with your WordPress account and come back here.
            </p>
          </div>
        )}
      </OptionCard>

      {props.allowLocal && (
        <OptionCard
          id="storage-local"
          selected={props.value.kind === 'local'}
          onSelect={() => props.onChange({ kind: 'local' })}
          icon={<span className="w-8 h-8 rounded-[9px] bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700">{Icons.render('phonePortraitOutline')}</span>}
          title="Only on this device"
        >
          <p className="text-sm text-orange-800">Saved only in this browser, with no backup. Clearing browsing data, private browsing or losing this device deletes it. You can move it to Dropbox or WordPress later.</p>
        </OptionCard>
      )}

      {isWordPressChoice(props.value) && (
        <div className="pt-2">
          <label
            htmlFor="storageAccessLevel"
            className="block text-sm text-gray-700 mb-1"
          >
            Who can see it on the site
          </label>
          <select
            id="storageAccessLevel"
            value={accessLevel}
            onChange={(event) => props.onChange({ ...props.value, accessLevel: event.target.value as TAccessLevel } as TStorageChoice)}
            className={`${FORM_ELEMENTS_CSS_CLASSES} w-full px-3 py-2 text-sm`}
          >
            {(Object.keys(ACCESS_LEVEL_LABELS) as Array<TAccessLevel>).map(level => (
              <option
                key={level}
                value={level}
              >
                {ACCESS_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
