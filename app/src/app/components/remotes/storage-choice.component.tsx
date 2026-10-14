import { useAtomValue } from 'jotai'
import { Icons } from 'app/libs/icons/icons.class'
import { SiteIcon } from 'app/components/remotes/remote-card.component'
import { FORM_ELEMENTS_CSS_CLASSES } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { ACCESS_LEVEL_LABELS, DEFAULT_ACCESS_LEVEL, WORD_PRESS_ROLE_WEIGHT, WORDPRESS_PLUGIN_NAME, WORDPRESS_PLUGIN_URL } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC, ReactNode } from 'react'
import type { IWordPressRemoteInfo, TAccessLevel } from 'app/libs/cloud-sync/wordpress/wordpress.const'

export type TStorageChoice =
  | { kind: 'local' }
  | { kind: 'remote'; remoteId: string; accessLevel: TAccessLevel }
  | { kind: 'connect'; siteUrl: string; accessLevel: TAccessLevel }

/**
 * Sites where the user can create projects.
 */
export const useWritableRemotes = (): Array<IWordPressRemoteInfo> => (
  useAtomValue(SyncStateAtoms.wordPressRemotes).filter(remote => (
    !remote.needsReauth && (remote.data.can_create_projects ?? WORD_PRESS_ROLE_WEIGHT[remote.data.user_role] >= WORD_PRESS_ROLE_WEIGHT[remote.data.can_create_projects_role])
  ))
)

/**
 * The storage proposed by default: the first connected site, otherwise this device.
 */
export const defaultStorageChoice = (remotes: Array<IWordPressRemoteInfo>, allowLocal: boolean): TStorageChoice => {
  if (remotes.length) {
    return { kind: 'remote', remoteId: remotes[0].remoteId, accessLevel: DEFAULT_ACCESS_LEVEL }
  }
  return allowLocal ? { kind: 'local' } : { kind: 'connect', siteUrl: '', accessLevel: DEFAULT_ACCESS_LEVEL }
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
 * Where a project is stored: on a connected WordPress site, on a site to connect now, or only on this device.
 */
export const StorageChoice: FC<IStorageChoiceProps> = (props) => {
  const remotes = useWritableRemotes()
  const accessLevel = props.value.kind === 'local' ? DEFAULT_ACCESS_LEVEL : props.value.accessLevel

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
          badge={index === 0 ? RECOMMENDED : undefined}
        >
          <p className="text-sm text-gray-600">Saved on your WordPress site: backed up, available on all your devices, shareable with the site&apos;s users.</p>
        </OptionCard>
      ))}

      <OptionCard
        id="storage-connect"
        selected={props.value.kind === 'connect'}
        onSelect={() => props.onChange({ kind: 'connect', siteUrl: props.value.kind === 'connect' ? props.value.siteUrl : '', accessLevel })}
        icon={<span className="ui-avatar w-8 h-8 rounded-[9px]">{Icons.render('logoWordpress')}</span>}
        title={remotes.length ? 'Another WordPress site' : 'My WordPress site'}
        badge={remotes.length ? undefined : RECOMMENDED}
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
          <p className="text-sm text-orange-800">Saved only in this browser, with no backup. Clearing browsing data, private browsing or losing this device deletes it. You can move it to WordPress later.</p>
        </OptionCard>
      )}

      {props.value.kind !== 'local' && (
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
